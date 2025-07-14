import React, { FlatList, StyleSheet, Text, View } from "react-native";

const FeesDetailedList = ({ route, navigation }) => {
  const { groupname, details } = route.params;

  const _renderItem = ({ item }) => {
    return (
      <View style={styles.feesItemWrapper}>
        <View style={{ flex: 1, alignSelf: 'stretch', maxWidth: 200 }}>
          <Text style={[styles.feesItemHead, item.dueHead === 'Y' && styles.feesItemColorDue]}>
            {item.headName}
          </Text>
        </View>
        <View style={{ flex: 1, alignSelf: 'stretch' }}>
          <Text style={[styles.feesItemAmount, item.dueHead === 'Y' && styles.feesItemColorDue]}>
            {Math.abs(item.feesMinusDeductionAmount)}
          </Text>
        </View>
        <View style={{ flex: 1, alignSelf: 'stretch' }}>
          <Text style={[styles.feesItemInstallmentName, item.dueHead === 'Y' && styles.feesItemColorDue]}>
            {item.installmentName}
          </Text>
        </View>
        <View style={{ flex: 1, alignSelf: 'stretch' }}>
          <Text style={[styles.feesItemInstallmentName, item.dueHead === 'Y' && styles.feesItemColorDue]}>
            {item.dueDate}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View>
      <FlatList
        data={details}
        renderItem={_renderItem}
        keyExtractor={item => item.feesHeadValueId}
        ListHeaderComponent={<Text style={styles.feeHeading}>{groupname}</Text>}
        ListFooterComponent={<View style={{ height: 100 }}></View>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  feesItemWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    flex: 1,
    borderBottomColor: '#666666',
    borderBottomWidth: 1
  },
  feesItemHead: {
    fontSize: 14,
  },
  feesItemAmount: {
    fontSize: 14,
    textAlign: 'center'
  },
  feesItemInstallmentName: {
    fontSize: 14,
    textAlign: 'center'
  },
  feeHeading: {
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2f8dd7',
    marginTop: 20,
    borderBottomColor: '#666666',
    borderBottomWidth: 1,
    paddingBottom: 20
  },
  feesItemColorDue: {
    color: '#F44336'
  }
});

export default FeesDetailedList;
