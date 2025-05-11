import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (optional - uses default fonts if not registered)
// Font.register({
//   family: 'Helvetica',
//   src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.woff2'
// });

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
  },
  signatureArea: {
    marginTop: 30,
  },
  signatureLine: {
    borderBottom: '1px solid black',
    width: '60%',
    marginTop: 30,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
  },
  dateArea: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  dateLabel: {
    fontSize: 10,
    width: '20%',
  },
  dateLine: {
    borderBottom: '1px solid black',
    width: '40%',
    marginBottom: 5,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid black',
    paddingBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: 'center',
    color: 'grey',
    borderTop: '1px solid #ccc',
    paddingTop: 5,
  },
});

// Create PDF Document Component
const PDFWaiverTemplate = ({ gymName, gymAddress = "123 Main Street, City, State ZIP" }) => {
  const currentDate = new Date().toLocaleDateString();
  
  return (
    <Document>
      {/* Page 1: Main Waiver Content */}
      <Page style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MARTIAL ARTS WAIVER AND RELEASE OF LIABILITY</Text>
          <Text style={{textAlign: 'center', fontSize: 12, marginBottom: 10}}>{gymName}</Text>
          <Text style={{textAlign: 'center', fontSize: 10}}>{gymAddress}</Text>
        </View>
        
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            In consideration of being allowed to participate in any way in the programs, events, and activities of <Text style={styles.bold}>{gymName}</Text>, I acknowledge, understand, and agree that:
          </Text>
        </View>
        
        {/* Risk Acknowledgement */}
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            1. Participation in martial arts activities involves risks of injury, disability, or death.
          </Text>
          <Text style={styles.paragraph}>
            2. I KNOWINGLY AND FREELY ASSUME ALL SUCH RISKS, both known and unknown.
          </Text>
          <Text style={styles.paragraph}>
            3. I, for myself and on behalf of my heirs, assigns, personal representatives and next of kin, HEREBY RELEASE AND HOLD HARMLESS <Text style={styles.bold}>{gymName}</Text>, its officers, officials, agents, employees, other participants, and sponsors, WITH RESPECT TO ANY AND ALL INJURY, DISABILITY, DEATH, or loss or damage to person or property.
          </Text>
          <Text style={styles.paragraph}>
            4. I understand the nature of martial arts activities and believe I am qualified to participate.
          </Text>
          <Text style={styles.paragraph}>
            5. I have read this waiver, fully understand its terms, and sign it freely and voluntarily.
          </Text>
        </View>
        
        {/* Medical Treatment Consent */}
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            In the event of injury, I authorize <Text style={styles.bold}>{gymName}</Text> to obtain medical treatment deemed necessary for myself or my child. I understand that I am responsible for any medical costs incurred.
          </Text>
        </View>
        
        {/* Image Use Consent */}
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            I grant permission to <Text style={styles.bold}>{gymName}</Text> to use photographs, video recordings, or any other likeness of myself or my child for marketing and promotional purposes without compensation.
          </Text>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>This waiver is effective as of {currentDate}. Page 1 of 2.</Text>
        </View>
      </Page>
      
      {/* Page 2: Signature Page */}
      <Page style={styles.page}>
        {/* Header for continuation context */}
        <View style={styles.header}>
          <Text style={styles.title}>MARTIAL ARTS WAIVER - SIGNATURE PAGE</Text>
          <Text style={{textAlign: 'center', fontSize: 12, marginBottom: 10}}>{gymName}</Text>
        </View>
        
        {/* Signature Instruction */}
        <View style={styles.section}>
          <Text style={{...styles.paragraph, ...styles.bold, marginTop: 20, marginBottom: 40, textAlign: 'center'}}>
            I HAVE READ AND UNDERSTAND THIS AGREEMENT, AND I AM SIGNING IT VOLUNTARILY.
          </Text>
        </View>
        
        {/* Participant Signature Section */}
        <View style={{marginBottom: 60}}>
          <Text style={styles.signatureLabel}>Participant Name (Printed):</Text>
          <View style={styles.signatureLine} />
          
          <View style={{marginTop: 40}}>
            <Text style={styles.signatureLabel}>Participant Signature:</Text>
            <View style={styles.signatureLine} />
          </View>
          
          <View style={styles.dateArea}>
            <Text style={styles.dateLabel}>Date:</Text>
            <View style={styles.dateLine} />
          </View>
        </View>
        
        {/* Parent/Guardian Signature Section */}
        <View style={{marginTop: 60}}>
          <Text style={styles.signatureLabel}>Parent/Guardian Name (If participant is under 18):</Text>
          <View style={styles.signatureLine} />
          
          <View style={{marginTop: 40}}>
            <Text style={styles.signatureLabel}>Parent/Guardian Signature:</Text>
            <View style={styles.signatureLine} />
          </View>
          
          <View style={styles.dateArea}>
            <Text style={styles.dateLabel}>Date:</Text>
            <View style={styles.dateLine} />
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>This waiver is effective as of {currentDate}. Please consult with a lawyer before implementing this waiver at your gym. Page 2 of 2.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFWaiverTemplate;