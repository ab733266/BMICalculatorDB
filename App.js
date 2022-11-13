import { useState, useEffect } from "react";
import { Platform, Alert, StyleSheet, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, } from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => { },
        };
      },
    };
  }

  const bmiDB = SQLite.openDatabase("bmiDB.db");
  return bmiDB;
}

const bmiDB = openDatabase();

function Items() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    bmiDB.transaction((tx) => {
      tx.executeSql(
        `select id, weight, height, bmi, date(bmiDate) as bmiDate from bmiTable order by bmiDate desc;`,
        // [doneHeading ? 1 : 0],
        (_, { rows: { _array } }) => setItems(_array)
      );
    });
  }, []);

  if (items === null || items.length === 0) {
    return null;
  }

  //this is the bottom table
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>BMI History</Text>
      {items.map(({ id, weight, height, bmi, bmiDate }) => (
        <Text style={{ color: "#fff"}} key={id}>{bmiDate}: {bmi} W:{weight}, H:{height}</Text>
      ))}
    </View>
  );
}

//this is the enter stuff table
export default function App() {
  const [bmi, setBmi] = useState(null);
  const [info, setInfo] = useState(null);
  const [height, setHeight] = useState(null);
  const [weight, setWeight] = useState(null);

  const handleBmi = () => {
    let val = (
      [Number(weight) / (Number(height) * Number(height))] * 703).toFixed(1);
    setBmi(val);
    if (val < 18.5) {
      setInfo("Under Weight");
    } else if (val > 18.5 && val <= 24.9) {
      setInfo("Healthy");
    } else if (val > 24.9 && val < 30) {
      setInfo("Overweight");
    } else {
      setInfo("Obese");
    }
  };

  useEffect(() => {
    bmiDB.transaction((tx) => {
      tx.executeSql(
        "create table if not exists bmiTable (id integer primary key not null, weight int, height int, bmi int, bmiDate real);"
      );
    });
  }, []);

  const add = (weight, height, bmi) => {
    // is text empty?
    if (weight === null || weight === "" || height === null || height === "") {
      return false;
    }

    bmiDB.transaction(
      (tx) => {
        tx.executeSql("insert into bmiTable (weight, height, bmi, bmiDate) values (0, ?, ?, ?, julianday('now'))", [weight, height, bmi]);
        tx.executeSql("select * from bmiTable", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      // forceUpdate
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.toolbar}>BMI Calculator</Text>
      <ScrollView style={styles.content}>
        <TextInput
          onChangeText={()=> {(height) => setHeight(height); add(height);}}
          placeholder="Height in Inches"
          style={styles.input}
          value={height}
        />
        <TextInput
          type="text"
          onChangeText={()=> {(weight) => setWeight(weight); add(weight);}}
          placeholder="Weight in Pounds"
          style={styles.input}
          value={weight}
        />
        <TouchableOpacity onPress={handleBmi} style={styles.button}>
          <Text style={styles.buttonText}>Compute BMI</Text>
        </TouchableOpacity>
        <Text style={styles.preview}>Body Mass Index is {bmi} ({info})</Text>

        <ScrollView style={styles.listArea}>
          <Items>
          </Items>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toolbar: {
    backgroundColor: '#f4511e',
    color: '#fff',
    textAlign: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -50
  },
  content: {
    flex: 1,
    padding: 10,
  },
  input: {
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    height: 45,
    padding: 5,
    marginBottom: 10,
    flex: 1,
    fontSize: 24
  },
  button: {
    backgroundColor: '#34495e',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24
  },
  preview: {
    color: '#000',
    flex: 1,
    height: 80,
    fontSize: 28,
    marginTop: 60,
    marginBottom: 30,
    textAlign: 'center'
  },
  text: {
    color: '#000',
    fontSize: 20,
  },
  textIndent: {
    color: '#000',
    fontSize: 20,
    marginLeft: 20,
  },
  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 16,
    fontSize: 20
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 24,
    marginBottom: 8,
  },
});

// const [weight, setWeight] = useState(null);
// const [height, setHeight] = useState(null);

// //const [forceUpdate, forceUpdateId] = useForceUpdate();

// useEffect(() => {
//   db.transaction((tx) => {
//     tx.executeSql(
//       "create table if not exists bmiTable (id integer primary key not null, weight int, height int, bmi int, bmiDate real);"
//     );
//   });
// }, []);

// const add = (weight, height) => {
//   // is text empty?
//   if (weight === null || weight === "" || height === null || height === "") {
//     return false;
//   }

//   db.transaction(
//     (tx) => {
//       tx.executeSql("insert into bmiTable (weight, height, bmi, bmiDate) values (0, ?, ?, ?, julianday('now'))", [int]);
//       tx.executeSql("select * from bmiTable", [], (_, { rows }) =>
//         console.log(JSON.stringify(rows))
//       );
//     },
//     null,
//     forceUpdate
//   );
// };

// return (
//   <View style={styles.container}>
//     <Text style={styles.heading}>SQLite Example</Text>

//     {Platform.OS === "web" ? (
//       <View
//         style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
//       >
//         <Text style={styles.heading}>
//           Expo SQlite is not supported on web!
//         </Text>
//       </View>
//     ) : (
//       <>
//         <View style={styles.flexRow}>
//           <TextInput
//             onChangeText={(weight) => setWeight(weight)}
//             onSubmitEditing={() => {
//               add(weight);
//               setWeight(null);
//             }}
//             placeholder="Weight in Pounds"
//             style={styles.input}
//             value={weight}
//           />
//         </View>
//         <View style={styles.flexRow}>
//           <TextInput
//             onChangeText={(height) => setHeight(height)}
//             onSubmitEditing={() => {
//               add(height);
//               setHeight(null);
//             }}
//             placeholder="Height in Inches"
//             style={styles.input}
//             value={height}
//           />
//         </View>
//         <TouchableOpacity onPress={() => { this.onCalculate(); }}
//           style={styles.button}
//           value={bmi}>
//           <Text style={styles.buttonText}>Compute BMI</Text>
//         </TouchableOpacity>
//         <ScrollView style={styles.listArea}>
//         <Items
//             key={`forceupdate-todo-${forceUpdateId}`}
//             done={false}
//             onPressItem={(id) =>
//               db.transaction(
//                 (tx) => {
//                   tx.executeSql(`update bmiTable set done = 1 where id = ?;`, [
//                     id,
//                   ]);
//                 },
//                 null,
//                 forceUpdate
//               )
//             }
//           />
//           <Items
//             done
//             key={`forceupdate-done-${forceUpdateId}`}
//             onPressItem={(id) =>
//               db.transaction(
//                 (tx) => {
//                   tx.executeSql(`delete from items where id = ?;`, [id]);
//                 },
//                 null,
//                 forceUpdate
//               )
//             }
//           /> 
//         </ScrollView>
//       </>
//     )}
//   </View>
// );
// }

// function useForceUpdate() {
//   const [value, setValue] = useState(0);
//   return [() => setValue(value + 1), value];
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#fff",
//     flex: 1,
//     paddingTop: Constants.statusBarHeight,
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   flexRow: {
//     flexDirection: "row",
//   },
//   input: {
//     borderColor: "#4630eb",
//     borderRadius: 4,
//     borderWidth: 1,
//     flex: 1,
//     height: 48,
//     margin: 16,
//     padding: 8,
//   },
//   listArea: {
//     backgroundColor: "#f0f0f0",
//     flex: 1,
//     paddingTop: 16,
//   },
//   sectionContainer: {
//     marginBottom: 16,
//     marginHorizontal: 16,
//   },
//   sectionHeading: {
//     fontSize: 18,
//     marginBottom: 8,
//   },
// });
