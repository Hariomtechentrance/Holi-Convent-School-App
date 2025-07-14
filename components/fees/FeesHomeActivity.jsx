import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, Alert, SafeAreaView, Pressable, Modal } from 'react-native';
import { Appbar, Text, TextInput, Button, ActivityIndicator, Card, Avatar } from 'react-native-paper';
import { Colors, Spacing, FontSizes } from '../../styles/CommonStyles';
import { BUTTON_MODE, FEES_APP_API, GATEWAY_SOURCE, PAYMENT_GATEWAY_API, rupees } from '../../helpers/constants';
import { ApiHelper } from '../../helpers/ApiHelper';
import { MessageHelper } from '../../helpers/MessageHelper';
import { showMessage } from 'react-native-flash-message';
import {
  createIntitateFeesTransactionMainRequest,
  createFeesTransactionObjectRequest,
  createFeesDetailsObjectRequest,
  createGroupDetailObjectRequest,
  validatePaymentAmount,
  validateFeesData,
  validateStudentInfo
} from '../../helpers/PaymentTypes';
import RenderRecentPayments from './RenderRecentPayments';

const fontSize = 14;

const FeesHomeActivity = ({ route, navigation }) => {
  const routeParam = route.params;
  const studentInfo = routeParam.studentInfo;
  const transURL = routeParam.transURL;

  const [studentConfig, setStudentConfig] = useState();
  const [allFeesDetail, setAllFeesDetail] = useState();
  const [isWorking, setWorking] = useState(false);
  const [academicDataList, setAcademicDataList] = useState([]);
  const [valueAcademicYears, setValueAcademicYears] = useState("");
  const [itemsAcademicYears, setItemsAcademicYears] = useState([]);
  const [previousYearFeesPending, setPreviousYearFeesPending] = useState(false);
  const [feesDetails, setFeesDetails] = useState([]);
  const [prevYearFeesDetails, setPrevYearFeesDetails] = useState([]);
  const [summaryData, setSummaryData] = useState();
  const [recentPayments, setRecentPayments] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({
        title: `FEES : ${studentInfo.studentName}`
      });
    }
  }, [navigation]);

  function getQueryParam(url, param) {
    const queryString = url.split('?')[1];
    if (!queryString) return null;

    const params = queryString.split('&');
    for (let i = 0; i < params.length; i++) {
      const pair = params[i].split('=');
      if (decodeURIComponent(pair[0]) === param) {
        return decodeURIComponent(pair[1].replace(/\+/g, ' '));
      }
    }
    return null;
  }

  useEffect(() => {
    if (transURL) {
      console.log("URL received .....", transURL);
      let msg = getQueryParam(transURL, 'msg');

      if (msg) {
        Alert.alert("Fees", msg);
      }

      if (transURL.toLowerCase().includes('receipt')) {
        setTimeout(() => {
          navigation.navigate('ViewReceipts', {
            studentInfo: studentInfo,
            title: 'View Receipts',
            forceRefresh: true
          });
        }, 1000);
      }
    }
  }, [transURL]);

  async function getStudentConfig(year, classname, division) {
    let result = null;
    console.log("studentInfo", studentInfo);
    setWorking(true);

    try {
      let url = `${PAYMENT_GATEWAY_API}/student/config?dbName=${studentInfo.feesDbName}&schoolDB=${studentInfo.instDbValue}&parentID=${studentInfo.pId}&className=${classname}&divName=${division}&sessionYear=${year}`;
      result = await ApiHelper.callGetAPI(url);

      let apiResponse = result.result;
      let baseYear = 0;
      const prevYearFees = apiResponse.PREV_YEAR_FEES;

      if (prevYearFees.length > 4) {
        baseYear = parseInt(prevYearFees.split("-")[0], 10);
      }

      const studentConfig = {
        COMMUNICATION_PARENT: apiResponse.COMMUNICATION_PARENT,
        COMMUNICATION_TEACHER: apiResponse.COMMUNICATION_TEACHER,
        FEE_BIFURCATION: apiResponse.FEE_BIFURCATION,
        FEE_BIFURCATION_REQUIRED: apiResponse.FEE_BIFURCATION && apiResponse.FEE_BIFURCATION === "Y" ? true : false,
        FEE_BIFURCATION_GROUP_NAME: apiResponse.FEE_BIFURCATION_GROUP_NAME
          ? apiResponse.FEE_BIFURCATION_GROUP_NAME.split(',')
          : [],
        ONLINE_FEE: apiResponse.ONLINE_FEE,
        ONLINE_FEE_MESSAGE: apiResponse.ONLINE_FEE_MESSAGE,
        PENDING_FEE: apiResponse.PENDING_FEE,
        PREV_YEAR_FEES: apiResponse.PREV_YEAR_FEES,
        CURRENT_YEAR: year,
        BASE_YEAR: baseYear
      };

      console.log("api Response Student Config", studentConfig);
      setStudentConfig(studentConfig);
      return studentConfig;

    } catch (error) {
      console.log(error);
      MessageHelper.showMessage(showMessage, "" + error, "danger");
      result = null;
    } finally {
      setWorking(false);
    }
  }

  async function getAcademicYearWithFees() {
    let result = null;
    console.log("studentInfo", studentInfo);
    setWorking(true);

    let apiPayload = {
      feesDbName: studentInfo.feesDbName,
      instDbValue: studentInfo.instDbValue,
      feesEntryType: studentInfo.feesEntryType,
      configProp: studentInfo.configProp,
      localhostProp: studentInfo.localhostProp,
      pId: studentInfo.pId
    };

    try {
      result = await ApiHelper.callPostAPI(FEES_APP_API + "getAcademicYearWithFees", apiPayload);
      console.log("getAcademicYearWithFees", result);

      if (result.acedemicYearList && Array.isArray(result.acedemicYearList)) {
        let years = [];
        setAcademicDataList(result.AcedemicDataList);

        for (let index = 0; index < result.acedemicYearList.length; index++) {
          years.push({
            label: result.acedemicYearList[index],
            value: result.acedemicYearList[index] + "," + index
          });
        }

        const allFeesData = new Map();
        result.feesDataList.forEach((item) => {
          const feeDetails = {
            feesMainObjects: item.feesDetails,
            feesEnabledForClass: item.feesEnabledForClass
          };
          allFeesData.set(item.ResponseMsg, feeDetails);
        });

        console.log("allFeesData", allFeesData);
        setAllFeesDetail(allFeesData);
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

  async function fetchRecentPayments() {
    let result;
    setWorking(true);
    try {
      let url = `${PAYMENT_GATEWAY_API}/payment/recentPayments?schoolDB=${studentInfo.feesDbName}&parentID=${studentInfo.pId}`;
      result = await ApiHelper.callGetAPI(url);
      setRecentPayments(result.result);
    } catch (error) {
      console.log(error);
      MessageHelper.showMessage(showMessage, "" + error, "danger");
      result = null;
      setRecentPayments([]);
    }
    setWorking(false);
  }

  useEffect(() => {
    getAcademicYearWithFees();
  }, []);

  useEffect(() => {
    fetchRecentPayments();
  }, [route]);

  useEffect(() => {
    fetchSelectedYearData(valueAcademicYears);
  }, [valueAcademicYears]);

  async function fetchSelectedYearData(selectedYearValue) {
    if (!selectedYearValue || selectedYearValue === "") return;

    const yearIndex = selectedYearValue.split(",");
    console.log("yearindex", yearIndex);

    if (yearIndex.length == 2) {
      const academicYear = academicDataList[parseInt(yearIndex[1])];

      let apiPayload = {
        feesDbName: studentInfo.feesDbName,
        pId: studentInfo.pId,
        className: academicYear.className,
        admissionType: academicYear.admissionType,
        feesEntryType: studentInfo.feesEntryType,
        academicYear: academicYear.session,
        configProp: studentInfo.configProp,
        localhostProp: studentInfo.localhostProp,
        section: academicYear.section
      };

      let result;
      setWorking(true);

      try {
        result = await ApiHelper.callPostAPI(FEES_APP_API + "getFeesDetails", apiPayload);
        setWorking(false);
        let studentConfig = await getStudentConfig(academicYear.session, academicYear.className, academicYear.divisionId);

        // Check for Previous Years
        const userSelectedYear = parseInt(academicYear.session.split("-")[0]);
        console.log("selectedBaseYear", userSelectedYear);

        let previousYearFeesPending = false;
        let prevYearfeesDetails = [];

        if (allFeesDetail && studentConfig) {
          for (const [allfeesYear, allFeesfeeDetails] of allFeesDetail) {
            if (allfeesYear === academicYear.session) {
              // current Year
            } else {
              const currentKeyYear = parseInt(allfeesYear.split("-")[0]);
              const tmpfeesDetails = allFeesfeeDetails.feesMainObjects;
              let mainCurrentDue = 0;
              let mainTotalDue = 0;

              tmpfeesDetails.forEach(detail => {
                mainCurrentDue += parseFloat(detail.currDueBal) || 0;
                mainTotalDue += parseFloat(detail.totalBalaceAmount) || 0;
              });

              if (mainCurrentDue > 0 || mainTotalDue > 0) {
                if (currentKeyYear >= studentConfig.BASE_YEAR) {
                  if (currentKeyYear < userSelectedYear) {
                    previousYearFeesPending = true;
                  }
                }

                prevYearfeesDetails.push({
                  mainCurrentDue: mainCurrentDue,
                  mainTotalDue: mainTotalDue,
                  session: allfeesYear
                });
              }
            }
          }
        }

        setPreviousYearFeesPending(previousYearFeesPending);
        setPrevYearFeesDetails(prevYearfeesDetails);

        let totalDue = 0;
        let currentDue = 0;

        if (result.feesDetails && Array.isArray(result.feesDetails)) {
          let feesDetails = [];

          for (let index = 0; index < result.feesDetails.length; index++) {
            let fee = result.feesDetails[index];
            fee.currDueBalFloat = parseFloat(fee.currDueBal) || 0;
            fee.totalBalaceAmountFloat = parseFloat(fee.totalBalaceAmount) || 0;
            fee.totalDiscountFloat = parseFloat(fee.totalDiscount) || 0;
            fee.sysID = `feesList_${index}`;

            totalDue += fee.totalBalaceAmountFloat;
            currentDue += fee.currDueBalFloat;

            if (fee.currDueBalFloat > 0 || fee.totalBalaceAmountFloat > 0) {
              feesDetails.push(fee);
            }
          }

          console.log("Fees List", feesDetails);
          setSummaryData({ totalDue, currentDue });
          setFeesDetails(feesDetails);
        }
      } catch (error) {
        console.log(error);
        MessageHelper.showMessage(showMessage, "" + error, "danger");
        result = null;
      }
      setWorking(false);
    }
  }

  const onSelectDropDown = (value) => {
    setValueAcademicYears(value);
    setShowDropdown(false);
  };

  const getSelectedYearLabel = () => {
    const selectedItem = itemsAcademicYears.find(item => item.value === valueAcademicYears);
    return selectedItem ? selectedItem.label : 'Select Year';
  };

  const renderCustomDropdown = () => {
    return (
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f5f5f5',
        marginHorizontal: 6,
        marginBottom: 10
      }}>
        <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>
          Select Academic Year
        </Text>
        
        <TouchableOpacity
          onPress={() => setShowDropdown(true)}
          style={{
            backgroundColor: '#ffffff',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#ddd',
            minWidth: 120,
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 14, color: '#333' }}>
            {getSelectedYearLabel()}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => setShowDropdown(false)}
          >
            <View style={{
              backgroundColor: 'white',
              borderRadius: 8,
              paddingVertical: 10,
              minWidth: 200,
              maxHeight: 300
            }}>
              <ScrollView>
                {itemsAcademicYears.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => onSelectDropDown(item.value)}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderBottomWidth: index < itemsAcademicYears.length - 1 ? 1 : 0,
                      borderBottomColor: '#eee'
                    }}
                  >
                    <Text style={{ 
                      fontSize: 16, 
                      color: valueAcademicYears === item.value ? '#2f8dd7' : '#333',
                      fontWeight: valueAcademicYears === item.value ? 'bold' : 'normal'
                    }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  async function handleItemOnPay(item, amount, headType) {
    if (!studentConfig) {
      return;
    }

    const yearIndex = valueAcademicYears.split(",");
    console.log("yearindex", yearIndex);
    const academicYear = academicDataList[parseInt(yearIndex[1])];
    const selectedAcademicYear = yearIndex[0];

    let feesEnabledForClass = [];

    if (allFeesDetail && studentConfig) {
      for (const [allfeesYear, allFeesfeeDetails] of allFeesDetail) {
        if (allfeesYear === selectedAcademicYear) {
          feesEnabledForClass = allFeesfeeDetails.feesEnabledForClass;
          break;
        }
      }
    }

    let isFeesEnable = true;
    let msg = studentConfig?.ONLINE_FEE_MESSAGE;

    if (feesEnabledForClass.length > 0) {
      msg = feesEnabledForClass[0].message;
    }

    if (feesEnabledForClass.length === 0) {
      isFeesEnable = true;
    } else if (feesEnabledForClass.length > 0 && feesEnabledForClass[0].enabled.toUpperCase() === "N") {
      isFeesEnable = false;
    }

    if (studentConfig.ONLINE_FEE && studentConfig.ONLINE_FEE.toUpperCase() === "N") {
      isFeesEnable = false;
    }

    if (isFeesEnable === false) {
      if (studentConfig.ONLINE_FEE !== null && studentConfig.ONLINE_FEE.toUpperCase() === "Y") {
        isFeesEnable = true;
      }
    }

    if (
      studentConfig.PENDING_FEE &&
      isFeesEnable &&
      studentConfig.PENDING_FEE.toUpperCase() === "Y" &&
      previousYearFeesPending
    ) {
      MessageHelper.showMessage(showMessage, "Your previous year fees are pending. Please ensure to pay that first", "info");
      isFeesEnable = false;
      return;
    }

    setWorking(true);

    const todayDate = new Date().toISOString().split('T')[0];

    const intitateFeesTransactionMainRequest = {
      feesOnlineTransactionDTO: [],
    };

    const feesTransactionObjectRequest = {
      feesDbName: studentInfo.feesDbName,
      academicYear: selectedAcademicYear,
      pId: studentInfo.pId,
      feesDate: todayDate,
      className: academicYear.className,
      divisionName: academicYear.divisionId,
      admissionType: academicYear.admissionType,
      configProp: studentInfo.configProp,
      localhostProp: studentInfo.localhostProp,
      feesDetails: [],
    };

    const feesDetailsObjectRequest = {
      groupName: item.groupName,
      groupConfigId: item.groupConfigId,
      amountPaid: amount,
      currDueBal: '0',
      fineAmount: '0',
      totalBal: `${(parseFloat(item.totalBalaceAmount) - parseFloat(amount)).toString()}`,
      totalDiscount: item.totalDiscount,
      transPresent: 'N',
      bankId: item.bankId,
      getway: item.getway,
      bankName: item.bankName,
      bankAccNo: item.bankAccNo,
      bankAccName: item.bankAccName,
      groupDetails: [],
    };

    const groupDetails = [];

    for (let i = 0; i < item.groupDetails.length; i++) {
      const groupDetailObjectRequest = {
        headName: item.groupDetails[i].headName,
        installmentName: item.groupDetails[i].installmentName,
        refundFlag: item.groupDetails[i].refundFlag,
        feesMinusDeductionAmount: item.groupDetails[i].feesMinusDeductionAmount,
        dueDate: item.groupDetails[i].dueDate,
        paidAmount: item.groupDetails[i].paidAmount,
        balFeesAmout: item.groupDetails[i].balFeesAmout,
        feesHeadValueId: item.groupDetails[i].feesHeadValueId,
        ctr: item.groupDetails[i].ctr,
        dueHead: item.groupDetails[i].dueHead,
        feesAmount: item.groupDetails[i].feesAmount,
      };

      if (headType === "currentDue" && item.groupDetails[i].dueHead === 'Y') {
        groupDetails.push(groupDetailObjectRequest);
      } else if (headType === "totalDue") {
        groupDetails.push(groupDetailObjectRequest);
      }
    }

    feesDetailsObjectRequest.groupDetails = groupDetails;
    const feesDetails = [feesDetailsObjectRequest];
    feesTransactionObjectRequest.feesDetails = feesDetails;
    const feesOnlineTransactionDTO = [feesTransactionObjectRequest];
    intitateFeesTransactionMainRequest.feesOnlineTransactionDTO = feesOnlineTransactionDTO;

    let initResult;
    try {
      initResult = await ApiHelper.callPostAPI(PAYMENT_GATEWAY_API + "/payment/init?requester=" + GATEWAY_SOURCE, intitateFeesTransactionMainRequest);
      console.log("init Trans Result", initResult);
    } catch (error) {
      console.log(error);
      MessageHelper.showMessage(showMessage, "" + error, "danger");
      initResult = null;
    }

    if (initResult) {
      let transID = initResult.result;
      let url = `${PAYMENT_GATEWAY_API}/payment/start?paymentID=${transID}&parentID=${studentInfo.pId}&requester=${GATEWAY_SOURCE}`;

      navigation.navigate('WebView', {
        url: url,
        closeURL: `${PAYMENT_GATEWAY_API}/payment/showmsg`,
        studentInfo: studentInfo,
        transID: transID,
        title: 'Payment',
        forceRefresh: true
      });
    }
    setWorking(false);
  }

  const _handleFeeHeading = (groupname, details) => {
    navigation.navigate('FeesDetailedList', {
      groupname, details
    });
  };

  const renderFeesDetail = ({ item }) => {
    console.log(item);
    return (
      <View style={{ marginBottom: 6 }}>
        <Card mode="outlined" style={{ backgroundColor: '#FFFFFF' }}>
          <Pressable onPress={() => { _handleFeeHeading(item.groupName, item.groupDetails) }}>
            <Text style={{
              textAlign: 'center',
              color: '#2f8dd7',
              fontSize: 16,
              textDecorationLine: "underline",
              fontWeight: "bold",
              marginBottom: 10
            }}>
              {item.groupName} (View More Details)
            </Text>
          </Pressable>

          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontSize: fontSize, color: '#000000' }}>Total Due Amount</Text>
              <Text style={{ color: '#F44336', fontSize: fontSize, fontWeight: 'bold' }}>
                {rupees}{item.totalBalaceAmount}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#2f8dd7',
                  paddingHorizontal: 15,
                  paddingVertical: 5,
                  borderRadius: 0
                }}
                onPress={() => handleItemOnPay(item, item.totalBalaceAmount, "totalDue")}
              >
                <Text style={{
                  fontSize: fontSize,
                  color: '#FFFFFF',
                  fontWeight: "bold"
                }}>PAY</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderPreviousYearFeesDetail = ({ item }) => (
    <View style={{ marginBottom: 6, marginTop: 2 }}>
      <Card mode="outlined" style={{ backgroundColor: '#FFFFFF' }}>
        <Card.Content>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <Text style={{
                color: '#F44336',
                fontSize: 22,
                fontWeight: "bold"
              }}>{item.session}</Text>
              <Text style={{ fontSize: 14, color: '#F44336' }}>Select year dropdown</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
              <Text style={{
                color: '#2f8dd7',
                fontSize: 22,
                fontWeight: "bold"
              }}>{rupees}{item.mainTotalDue}</Text>
              <Text style={{ fontSize: 14, color: '#000000' }}>Total Due Amount</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderFeeHeader = () => {
    return (
      <>
        {valueAcademicYears && summaryData &&
          <View style={{ marginBottom: 6 }}>
            <Card mode="outlined">
              <Card.Title
                title={"Fees Details for " + valueAcademicYears.split(',')[0]}
                titleStyle={{ textAlign: 'center', color: '#666666', fontSize: 14 }}
                style={{ backgroundColor: '#FFFFFF' }}
              />
              <Card.Content style={{ marginTop: -20, backgroundColor: '#FFFFFF' }}>
                <View style={{ flexDirection: "column" }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignContent: "center" }}>
                    <View style={{
                      flexDirection: "column",
                      justifyContent: "center",
                      alignContent: "center",
                      alignItems: "center"
                    }}>
                      <Text style={{
                        color: '#2f8dd7',
                        padding: 8,
                        fontSize: 22,
                        fontWeight: "bold"
                      }}> {rupees + summaryData.currentDue}</Text>
                      <Text style={{ fontSize: 14, color: '#000000' }}>Current Due Amount</Text>
                    </View>
                    <View style={{
                      flexDirection: "column",
                      justifyContent: "center",
                      alignContent: "center",
                      alignItems: "center"
                    }}>
                      <Text style={{
                        color: '#2f8dd7',
                        padding: 8,
                        fontSize: 22,
                        fontWeight: "bold"
                      }}> {rupees + summaryData.totalDue}</Text>
                      <Text style={{ fontSize: 14, color: '#000000' }}>Total Due Amount</Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
        }
      </>
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
          {renderCustomDropdown()}

          <View style={{ paddingLeft: 6, paddingRight: 6 }}>
            <FlatList
              data={prevYearFeesDetails}
              renderItem={renderPreviousYearFeesDetail}
              keyExtractor={item => item.session}
            />
          </View>

          <View style={{ paddingLeft: 6, paddingRight: 6 }}>
            <FlatList
              data={feesDetails}
              renderItem={renderFeesDetail}
              ListHeaderComponent={renderFeeHeader}
              keyExtractor={item => item.sysID}
            />
          </View>

          {recentPayments && recentPayments.length > 0 && (
            <RenderRecentPayments data={recentPayments} />
          )}

          <View style={{
            paddingLeft: 6,
            paddingRight: 6,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}>
            <Button
              mode={BUTTON_MODE}
              buttonColor={'#2f8dd7'}
              textColor={'#FFFFFF'}
              onPress={() => {
                console.log("On press receipts");
                navigation.navigate('ViewReceipts', {
                  studentInfo: studentInfo,
                  title: 'View Receipts',
                  forceRefresh: true
                });
              }}
            >
              VIEW RECEIPTS
            </Button>
          </View>
        </SafeAreaView>
      }

      {(isWorking || itemsAcademicYears.length <= 0) && (
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
      )}
    </>
  );
};

export default FeesHomeActivity;
