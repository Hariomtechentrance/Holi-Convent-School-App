import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes } from '../../styles/CommonStyles';
import { rupees } from '../../helpers/constants';

const RenderRecentPayments = ({ data }) => {
  const renderFooter = () => (
    <View style={{ marginTop: 20 }}>
      <Text> </Text>
    </View>
  );

  const renderPaymentItem = ({ item }) => (
    <View style={styles.dataRow}>
      <Text style={styles.dataCell}>{item.PAYMENT_ID}</Text>
      <Text style={styles.amountCell}>{rupees}{item.AMOUNT}</Text>
      <Text style={styles.stateCell} numberOfLines={1}>{item.STATE_NAME}</Text>
      <Text style={styles.timestampCell} numberOfLines={1}>{item.CREATED_TIMESTAMP}</Text>
    </View>
  );

  // disable it as per Ashish - but we'll enable it for HolyCrossConvent
  return (
    <>
      {data && data.length > 0 &&
        <View style={styles.container}>
          <Text style={styles.heading}>Recent Payments</Text>
          <View style={styles.tableContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.headerCell}>ID</Text>
              <Text style={styles.amountHeaderCell}>Amount</Text>
              <Text style={styles.statusHeaderCell}>Status</Text>
              <Text style={styles.timeHeaderCell}>TimeStamp</Text>
            </View>
            <FlatList
              data={data}
              keyExtractor={(item, index) => item.PAYMENT_ID?.toString() || index.toString()}
              ListFooterComponent={renderFooter}
              renderItem={renderPaymentItem}
              scrollEnabled={false}
            />
          </View>
        </View>
      }
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-start",
    padding: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  heading: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    textAlign: 'center',
    color: Colors.gray,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 0,
    padding: Spacing.sm,
    backgroundColor: Colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerCell: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: Colors.text,
    fontSize: FontSizes.sm,
  },
  amountHeaderCell: {
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'center',
    color: Colors.text,
    fontSize: FontSizes.sm,
  },
  statusHeaderCell: {
    fontWeight: 'bold',
    flex: 3,
    textAlign: 'center',
    color: Colors.text,
    fontSize: FontSizes.sm,
  },
  timeHeaderCell: {
    fontWeight: 'bold',
    flex: 4,
    textAlign: 'center',
    color: Colors.text,
    fontSize: FontSizes.sm,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: Colors.lightGray,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  dataCell: {
    flex: 1,
    textAlign: 'center',
    color: Colors.text,
    fontSize: FontSizes.xs,
  },
  amountCell: {
    flex: 2,
    textAlign: 'center',
    color: '#2f8dd7',
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
  },
  stateCell: {
    flex: 3,
    textAlign: 'center',
    color: Colors.text,
    fontSize: FontSizes.xs,
  },
  timestampCell: {
    flex: 4,
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: FontSizes.xs,
  },
});

export default RenderRecentPayments;
