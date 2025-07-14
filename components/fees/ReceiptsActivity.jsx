import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
  Image
} from "react-native";
import { Card, Text } from 'react-native-paper';
import { FEES_APP_API, rupees } from '../../helpers/constants';
import { ApiHelper } from '../../helpers/ApiHelper';
import { MessageHelper } from '../../helpers/MessageHelper';
import { showMessage } from 'react-native-flash-message';

const fontSize = 14;
const itemsPadding = 6;

const ReceiptsActivity = ({ route, navigation }) => {
  const routeParam = route.params;
  const studentInfo = routeParam.studentInfo;
  const [isWorking, setWorking] = useState(false);
  const [academicDataList, setAcademicDataList] = useState([]);
  const [openAcademicYears, setOpenAcademicYears] = useState(false);
  const [valueAcademicYears, setValueAcademicYears] = useState("");
  const [itemsAcademicYears, setItemsAcademicYears] = useState([]);
  const [receiptList, setReceiptList] = useState([]);

  async function fetchData() {
    let result = null;
    setWorking(true);

    let apiPayload = {
      feesDbName: studentInfo.feesDbName,
      pId: studentInfo.pId
    };

    try {
      result = await ApiHelper.callPostAPI(FEES_APP_API + "getAcademicYear", apiPayload);

      if (result.acedemicYearList && Array.isArray(result.acedemicYearList)) {
        let years = [];
        setAcademicDataList(result.AcedemicDataList);

        for (let index = 0; index < result.acedemicYearList.length; index++) {
          years.push({
            label: result.acedemicYearList[index],
            value: result.acedemicYearList[index] + "," + index
          });
        }

        setItemsAcademicYears(years);
        setValueAcademicYears(years[0].value);
      }
    } catch (error) {
      console.log(error);
      MessageHelper.showMessage(showMessage, "" + error, "danger");
      result = null;
    }
    setWorking(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({
        title: `Receipts : ${studentInfo.studentName}`
      });
    }
  }, [navigation]);

  useEffect(() => {
    fetchReceipts(valueAcademicYears);
  }, [valueAcademicYears]);

  async function fetchReceipts(selectedYearValue) {
    setReceiptList([]);
    if (!selectedYearValue || selectedYearValue === "") return;

    const yearIndex = selectedYearValue.split(",");
    console.log("yearindex", yearIndex);

    if (yearIndex.length == 2) {
      const academicYear = academicDataList[parseInt(yearIndex[1])];
      setWorking(true);

      let apiPayload = {
        feesDbName: studentInfo.feesDbName,
        pId: studentInfo.pId,
        ssoName: studentInfo.ssoName,
        ssoPass: studentInfo.ssoPass
      };

      let result;
      setWorking(true);

      try {
        result = await ApiHelper.callPostAPI(FEES_APP_API + "getPaymentReceipts", apiPayload);
        setReceiptList(result.receiptList);
        console.log(result);
      } catch (error) {
        console.log(error);
        MessageHelper.showMessage(showMessage, "" + error, "danger");
        result = null;
      }
      setWorking(false);
    }
  }

  const ReceiptRow = ({ item }) => {
    return (
      <Card style={{ margin: 8, backgroundColor: '#FFFFFF' }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#2f8dd7' }}> {rupees}{item.amountPaid} </Text>
            <View style={{ flex: 1, marginLeft: 35 }}>
              <Text style={{ fontSize: 16, color: 'black' }}>Receipt No : {item.receiptNo}</Text>
              <Text style={{ fontSize: 16, color: 'black' }}>Fees Date : {item.feesDate}</Text>
              <Text style={{ fontSize: 16, color: 'black' }}>Academic Year : {item.academicYear || '2024-2025'}</Text>
            </View>

            <TouchableOpacity onPress={async () => {
              try {
                const supported = await Linking.canOpenURL(item.receiptURL);
                if (supported) {
                  await Linking.openURL(item.receiptURL);
                } else {
                  console.error("Can't open the URL:", item.receiptURL);
                }
              } catch (error) {
                console.error('An error occurred while opening the URL:', error);
              }
            }}>
              <Image
                source={require('../../assets/ic_download.png')}
                style={{ tintColor: '#2f8dd7', width: 24, height: 24 }}
              />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <>
      {itemsAcademicYears && itemsAcademicYears.length > 0 &&
        <SafeAreaView style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          flexDirection: "column"
        }}>
          {receiptList && receiptList.length > 0 &&
            <View style={{ padding: itemsPadding }}>
              <FlatList
                data={receiptList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={ReceiptRow}
              />
            </View>
          }
        </SafeAreaView>
      }
      {isWorking &&
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <ActivityIndicator animating={true} />
        </View>
      }
    </>
  );
};

export default ReceiptsActivity;
