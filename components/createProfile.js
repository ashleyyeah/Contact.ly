import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef } from "react";
import { StyleSheet, ScrollView, Dimensions } from "react-native";
import { Avatar, View, Button, Icon, Colors, Assets, Incubator, Picker } from "react-native-ui-lib";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONTACT_KEYS } from "../utils/constants";

const { TextField } = Incubator;
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const dropdown = require('../assets/chevron.png');
const dropdownIcon = <Icon 
  source={dropdown} 
  style={{ 
    resizeMode: 'contain', 
    height: 20, 
    width: 20,
   }} 
  tintColor={Colors.$iconDefault}/>;

export default function CreateProfile({ route, navigation }) {
  const { forceUpdate, master, autofill, profile } = route.params;
  console.log(master);
  const [image, setImage] = useState(master['photo']);
  const [firstName, setFirstName] = useState(master['firstName']);
  const [name, setName] = useState(master['lastName']);
  const [icon, setIcon] = useState('');
  const [title, setTitle] = useState('');
  
  const [titleValue, setTitleValue] = useState('');
  const [valValue, setValValue] = useState('');
  const [numInputs, setNumInputs] = useState(1);
  const refInputs = useRef([{key: titleValue, value: valValue}]);

  useEffect(() => {
    async function fetchData() {
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted'){
        alert('Permission denied!')
      }
    }
    fetchData();
  }, [])

  const PickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })

    if (!result.cancelled){
      setImage(result.uri)
    }
  }

  const addHandler = () => {
    refInputs.current.push({key: '', value: ''});
    setNumInputs(value => value + 1);
  }

  const deleteHandler = (index) => {
    refInputs.current.splice(index, 1)[0];
    setNumInputs(value => value - 1);
  }

  const inputTitleHandler = (index, value) => {
    refInputs.current[index]['key'] = value;
    refInputs.current[index]['value'] = master[value];
    setTitleValue(value);
    setValValue(master[value]);
  }

  const inputValueHandler = (index, value) => {
    refInputs.current[index]['value'] = value;
    setValValue(value);
  }

  const navigate = () => {
    navigation.goBack();
  }

  async function saveProfile() {
    const currProfile = {'profileName': title, 'icon': icon, 'photo': image, 'firstName': firstName, 'lastName': name};
    for (let i = 0; i < numInputs; i++) {
      currProfile[refInputs.current[i]['key']] = refInputs.current[i]['value'];
    }
    let key = '@profile';
    if (title !== null) {
      key = '@' + title.toLowerCase().replace(/\s/g, '');
    }
    try {
      await AsyncStorage.setItem(key, JSON.stringify(currProfile))
    } catch (e) {
      // saving error
    }
    forceUpdate();
    navigate();
  }

  var inputs = []

  for (let i = 0; i < numInputs; i++) {
    inputs.push(
      <View key={i} style={styles.container_2}>
        <View style={{ width: '90%', justifyContent: 'center', marginHorizontal: 20 }}>
          <Picker
            onChange={item => inputTitleHandler(i, item.value)}
            placeholder={CONTACT_KEYS[refInputs.current[i]['key']]}
            placeholderTextColor={Colors.$textDefault}
            style={{ fontSize: 15, }}
            containerStyle={[{ 
              padding: 2,
              height: 25, 
              width: width * 0.3,
              borderWidth: 1,
              borderRadius: 7,
              borderColor: Colors.$textDisabled
            }]}
            trailingAccessory={dropdownIcon}
            migrateTextField
            useSafeArea
          >
            {autofill.map(option => (
              <Picker.Item key={option.key} value={option.value} label={option.label}/>
            ))}
          </Picker>
          <View style={{ flex: 1, flexDirection: 'row', width: width, marginBottom: 5, justifyContent: 'flex-start' }}>
            <TextField
              style={[styles.fields, { marginVertical: 5, marginRight: 7, width: width * 0.82 }]}
              onChangeText={(text) => inputValueHandler(i, text)}
              value={refInputs.current[i]['value']}
              autoCapitalize={'none'}
              autoCorrect={false}
            />
            <Button 
              backgroundColor={Colors.$backgroundPrimaryLight}
              style={{ height: 30, width: 30 }}
              color={Colors.grey10}
              iconSource={require('../assets/close.png')}
              iconStyle={{ resizeMode: 'contain', height: 25, width: 25 }}
              onPress={() => deleteHandler(i)} />
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container_main}>
      <View style={{ flexDirection: 'row' }}>
        <TextField 
          onChangeText={(value) => setIcon(value)}
          defaultValue={icon}
          textAlign={"center"}
          placeholder={'❔'}
          style={[styles.textinput, { marginRight: 5 }]}>
        </TextField>
        <TextField
          style={[styles.textinput, { minWidth: width-175 }]}
          onChangeText={(value) => setTitle(value)}
          defaultValue={title}
          placeholder={'Profile Name'}
          textAlign={"center"}
        />
      </View> 
      <View style={{ alignItems: 'center', justifyContent: 'center' }} >
        <Avatar 
          source={image ? { uri: image } : require('../assets/placeholder.png')} 
          size={100} 
          style={{ marginBottom: 10 }} />
        <Button label={image ? "Edit" : "Choose Image"}
          onPress={PickImage}
          backgroundColor={Colors.transparent}
          color={Colors.blue30}
          iconSource={Assets.icons.plusSmall} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', width: width }}>
          <TextField
            style={[styles.fields, { marginRight: 5, width: 0.3 * width }]}
            onChangeText={(text) => setFirstName(text)}
            value={firstName}
            placeholder={'First'}
            autoCapitalize={'none'}
            />
          <TextField
            style={[styles.fields, { marginBottom: 20, width: 0.45 * width }]}
            onChangeText={(text) => setName(text)}
            value={name}
            placeholder={'Last'}
            autoCapitalize={'none'}
            />
        </View>
        <View style={{ maxHeight: 0.35 * height }} >
          <ScrollView>{inputs}</ScrollView>
        </View>
      </View>
      <View style={[styles.container_1, { flex: 1, alignItems: 'center', justifyContent: 'flex-end' }]}>
        <Button 
          size={'large'}
          borderRadius={10}
          backgroundColor={Colors.transparent}
          color={Colors.blue30}
          iconSource={Assets.icons.plusSmall}
          style={{ marginBottom: 20 }}
          label={'Add Field'}
          onPress={addHandler} />
        <Button 
          size={'large'}
          borderRadius={10}
          backgroundColor={Colors.grey10}
          iconSource={Assets.icons.plusSmall}
          label={'Save'}
          style={{ marginBottom: 35}}
          onPress={() => {
            saveProfile();
          }} />
      </View>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container_main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
    width: width
  },
  container_1: {
    alignItems: "center",
    justifyContent: "center",
    width: width
  },
  container_2: {
    flexDirection:"row",
    width: width
  },
  container_3: {
    marginLeft: 10,
    marginRight: 10,
    width: '25%',
  },
  fields: {
    fontSize: 20, 
    borderBottomWidth: 1,
    borderColor: Colors.$outlineDisabledHeavy,
    paddingBottom: 4,
  },
  textinput: {
    fontSize: 25,
    marginVertical: 25,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: Colors.$outlineDisabledHeavy,
    paddingBottom: 4,
  }
});