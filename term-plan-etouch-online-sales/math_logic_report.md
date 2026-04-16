# Math Logic Report

## Key Calculation Highlights

### Rate Lookup: B5
- **Formula**: `=IFNA(VLOOKUP(B4,Medical_Rates,9,0),"")`
- **Current Value**: `4.9442`

### Rate Lookup: C5
- **Formula**: `=IFNA(VLOOKUP(C4,Non_Medical_Rates,9,0),"")`
- **Current Value**: `6.4275`

### Rate Lookup: D5
- **Formula**: `=VLOOKUP(D4,ADB_Rate,MATCH("Rate",ADB_Header,0),0)`
- **Current Value**: `1.1103`

### Rate Lookup: B6
- **Formula**: `=IFNA(VLOOKUP(B4,Medical_Rates,10,0),"")`
- **Current Value**: `0`

### Rate Lookup: C6
- **Formula**: `=IFNA(VLOOKUP(C4,Non_Medical_Rates,10,0),"")`
- **Current Value**: `0`

### Rate Lookup: B7
- **Formula**: `=IF(AND(I6="LSR",SA<10000000),0,IF(AND(I6="LSR",SA>=10000000),1,VLOOKUP($B$10,'HSAR Factor'!$A$1:$F$97,6,0)))`
- **Current Value**: `0`

### Rate Lookup: C7
- **Formula**: `=IF(AND(I6="LSR",SA<10000000),0,IF(AND(I6="LSR",SA>=10000000),1,VLOOKUP($B$10,'HSAR Factor'!$A$1:$F$97,6,0)))`
- **Current Value**: `0`

### Rate Lookup: N7
- **Formula**: `=IFERROR(IF(AND(Output!C61>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C61,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D61),0),0)`
- **Current Value**: `0`

### Rate Lookup: O7
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C61,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D61),0),0)`
- **Current Value**: `0`

### Rate Lookup: P7
- **Formula**: `=IFERROR(IF(AND(Output!C61>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C61,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D61),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q7
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C61,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D61),0),0)`
- **Current Value**: `0`

### Rate Lookup: N8
- **Formula**: `=IFERROR(IF(AND(Output!C62>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C62,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D62),0),0)`
- **Current Value**: `0`

### Rate Lookup: O8
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C62,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D62),0),0)`
- **Current Value**: `0`

### Rate Lookup: P8
- **Formula**: `=IFERROR(IF(AND(Output!C62>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C62,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D62),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q8
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C62,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D62),0),0)`
- **Current Value**: `0`

### Rate Lookup: N9
- **Formula**: `=IFERROR(IF(AND(Output!C63>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C63,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D63),0),0)`
- **Current Value**: `0`

### Rate Lookup: O9
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C63,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D63),0),0)`
- **Current Value**: `0`

### Rate Lookup: P9
- **Formula**: `=IFERROR(IF(AND(Output!C63>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C63,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D63),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q9
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C63,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D63),0),0)`
- **Current Value**: `0`

### Rate Lookup: N10
- **Formula**: `=IFERROR(IF(AND(Output!C64>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C64,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D64),0),0)`
- **Current Value**: `0`

### Rate Lookup: O10
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C64,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D64),0),0)`
- **Current Value**: `0`

### Rate Lookup: P10
- **Formula**: `=IFERROR(IF(AND(Output!C64>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C64,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D64),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q10
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C64,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D64),0),0)`
- **Current Value**: `0`

### Rate Lookup: N11
- **Formula**: `=IFERROR(IF(AND(Output!C65>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C65,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D65),0),0)`
- **Current Value**: `0`

### Rate Lookup: O11
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C65,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D65),0),0)`
- **Current Value**: `0`

### Rate Lookup: P11
- **Formula**: `=IFERROR(IF(AND(Output!C65>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C65,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D65),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q11
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C65,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D65),0),0)`
- **Current Value**: `0`

### Rate Lookup: N12
- **Formula**: `=IFERROR(IF(AND(Output!C66>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C66,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D66),0),0)`
- **Current Value**: `0`

### Rate Lookup: O12
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C66,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D66),0),0)`
- **Current Value**: `0`

### Rate Lookup: P12
- **Formula**: `=IFERROR(IF(AND(Output!C66>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C66,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D66),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q12
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C66,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D66),0),0)`
- **Current Value**: `0`

### Rate Lookup: N13
- **Formula**: `=IFERROR(IF(AND(Output!C67>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C67,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D67),0),0)`
- **Current Value**: `0`

### Rate Lookup: O13
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C67,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D67),0),0)`
- **Current Value**: `0`

### Rate Lookup: P13
- **Formula**: `=IFERROR(IF(AND(Output!C67>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C67,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D67),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q13
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C67,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D67),0),0)`
- **Current Value**: `0`

### Rate Lookup: N14
- **Formula**: `=IFERROR(IF(AND(Output!C68>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C68,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D68),0),0)`
- **Current Value**: `0`

### Rate Lookup: O14
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C68,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D68),0),0)`
- **Current Value**: `0`

### Rate Lookup: P14
- **Formula**: `=IFERROR(IF(AND(Output!C68>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C68,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D68),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q14
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C68,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D68),0),0)`
- **Current Value**: `0`

### Rate Lookup: N15
- **Formula**: `=IFERROR(IF(AND(Output!C69>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C69,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D69),0),0)`
- **Current Value**: `0`

### Rate Lookup: O15
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C69,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D69),0),0)`
- **Current Value**: `0`

### Rate Lookup: P15
- **Formula**: `=IFERROR(IF(AND(Output!C69>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C69,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D69),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q15
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C69,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D69),0),0)`
- **Current Value**: `0`

### Rate Lookup: N16
- **Formula**: `=IFERROR(IF(AND(Output!C70>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C70,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D70),0),0)`
- **Current Value**: `96680.13199677001`

### Rate Lookup: O16
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C70,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D70),0),0)`
- **Current Value**: `0`

### Rate Lookup: P16
- **Formula**: `=IFERROR(IF(AND(Output!C70>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C70,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D70),0),0)`
- **Current Value**: `193360.26399354002`

### Rate Lookup: Q16
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C70,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D70),0),0)`
- **Current Value**: `0`

### Rate Lookup: N17
- **Formula**: `=IFERROR(IF(AND(Output!C71>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C71,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D71),0),0)`
- **Current Value**: `92774.25528084`

### Rate Lookup: O17
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C71,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D71),0),0)`
- **Current Value**: `0`

### Rate Lookup: P17
- **Formula**: `=IFERROR(IF(AND(Output!C71>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C71,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D71),0),0)`
- **Current Value**: `185548.55728437`

### Rate Lookup: Q17
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C71,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D71),0),0)`
- **Current Value**: `0`

### Rate Lookup: N18
- **Formula**: `=IFERROR(IF(AND(Output!C72>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C72,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D72),0),0)`
- **Current Value**: `88948.92848247`

### Rate Lookup: O18
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C72,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D72),0),0)`
- **Current Value**: `0`

### Rate Lookup: P18
- **Formula**: `=IFERROR(IF(AND(Output!C72>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C72,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D72),0),0)`
- **Current Value**: `177897.90368763`

### Rate Lookup: Q18
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C72,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D72),0),0)`
- **Current Value**: `0`

### Rate Lookup: N19
- **Formula**: `=IFERROR(IF(AND(Output!C73>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C73,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D73),0),0)`
- **Current Value**: `85204.15160166`

### Rate Lookup: O19
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C73,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D73),0),0)`
- **Current Value**: `0`

### Rate Lookup: P19
- **Formula**: `=IFERROR(IF(AND(Output!C73>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C73,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D73),0),0)`
- **Current Value**: `170408.30320332`

### Rate Lookup: Q19
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C73,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D73),0),0)`
- **Current Value**: `0`

### Rate Lookup: N20
- **Formula**: `=IFERROR(IF(AND(Output!C74>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C74,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D74),0),0)`
- **Current Value**: `81539.87791572`

### Rate Lookup: O20
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C74,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D74),0),0)`
- **Current Value**: `0`

### Rate Lookup: P20
- **Formula**: `=IFERROR(IF(AND(Output!C74>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C74,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D74),0),0)`
- **Current Value**: `163079.75583144`

### Rate Lookup: Q20
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C74,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D74),0),0)`
- **Current Value**: `0`

### Rate Lookup: N21
- **Formula**: `=IFERROR(IF(AND(Output!C75>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C75,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D75),0),0)`
- **Current Value**: `77956.15414734001`

### Rate Lookup: O21
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C75,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D75),0),0)`
- **Current Value**: `0`

### Rate Lookup: P21
- **Formula**: `=IFERROR(IF(AND(Output!C75>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C75,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D75),0),0)`
- **Current Value**: `155912.30829468003`

### Rate Lookup: Q21
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C75,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D75),0),0)`
- **Current Value**: `0`

### Rate Lookup: N22
- **Formula**: `=IFERROR(IF(AND(Output!C76>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C76,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D76),0),0)`
- **Current Value**: `74452.98029651999`

### Rate Lookup: O22
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C76,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D76),0),0)`
- **Current Value**: `0`

### Rate Lookup: P22
- **Formula**: `=IFERROR(IF(AND(Output!C76>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C76,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D76),0),0)`
- **Current Value**: `148905.91387035002`

### Rate Lookup: Q22
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C76,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D76),0),0)`
- **Current Value**: `0`

### Rate Lookup: N23
- **Formula**: `=IFERROR(IF(AND(Output!C77>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C77,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D77),0),0)`
- **Current Value**: `71030.30964057`

### Rate Lookup: O23
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C77,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D77),0),0)`
- **Current Value**: `0`

### Rate Lookup: P23
- **Formula**: `=IFERROR(IF(AND(Output!C77>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C77,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D77),0),0)`
- **Current Value**: `142060.61928114`

### Rate Lookup: Q23
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C77,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D77),0),0)`
- **Current Value**: `0`

### Rate Lookup: N24
- **Formula**: `=IFERROR(IF(AND(Output!C78>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C78,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D78),0),0)`
- **Current Value**: `67688.18890218`

### Rate Lookup: O24
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C78,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D78),0),0)`
- **Current Value**: `0`

### Rate Lookup: P24
- **Formula**: `=IFERROR(IF(AND(Output!C78>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C78,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D78),0),0)`
- **Current Value**: `135376.33108167`

### Rate Lookup: Q24
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C78,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D78),0),0)`
- **Current Value**: `0`

### Rate Lookup: N25
- **Formula**: `=IFERROR(IF(AND(Output!C79>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C79,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D79),0),0)`
- **Current Value**: `64426.57135866`

### Rate Lookup: O25
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C79,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D79),0),0)`
- **Current Value**: `0`

### Rate Lookup: P25
- **Formula**: `=IFERROR(IF(AND(Output!C79>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C79,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D79),0),0)`
- **Current Value**: `128853.14271732`

### Rate Lookup: Q25
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C79,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D79),0),0)`
- **Current Value**: `0`

### Rate Lookup: N26
- **Formula**: `=IFERROR(IF(AND(Output!C80>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C80,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D80),0),0)`
- **Current Value**: `61245.5037327`

### Rate Lookup: O26
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C80,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D80),0),0)`
- **Current Value**: `0`

### Rate Lookup: P26
- **Formula**: `=IFERROR(IF(AND(Output!C80>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C80,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D80),0),0)`
- **Current Value**: `122491.0074654`

### Rate Lookup: Q26
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C80,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D80),0),0)`
- **Current Value**: `0`

### Rate Lookup: N27
- **Formula**: `=IFERROR(IF(AND(Output!C81>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C81,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D81),0),0)`
- **Current Value**: `58144.9860243`

### Rate Lookup: O27
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C81,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D81),0),0)`
- **Current Value**: `0`

### Rate Lookup: P27
- **Formula**: `=IFERROR(IF(AND(Output!C81>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C81,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D81),0),0)`
- **Current Value**: `116289.9720486`

### Rate Lookup: Q27
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C81,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D81),0),0)`
- **Current Value**: `0`

### Rate Lookup: N28
- **Formula**: `=IFERROR(IF(AND(Output!C82>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C82,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D82),0),0)`
- **Current Value**: `55124.97151077`

### Rate Lookup: O28
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C82,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D82),0),0)`
- **Current Value**: `0`

### Rate Lookup: P28
- **Formula**: `=IFERROR(IF(AND(Output!C82>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C82,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D82),0),0)`
- **Current Value**: `110249.98974423`

### Rate Lookup: Q28
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C82,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D82),0),0)`
- **Current Value**: `0`

### Rate Lookup: N29
- **Formula**: `=IFERROR(IF(AND(Output!C83>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C83,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D83),0),0)`
- **Current Value**: `52185.506914800004`

### Rate Lookup: O29
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C83,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D83),0),0)`
- **Current Value**: `0`

### Rate Lookup: P29
- **Formula**: `=IFERROR(IF(AND(Output!C83>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C83,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D83),0),0)`
- **Current Value**: `104371.06055229`

### Rate Lookup: Q29
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C83,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D83),0),0)`
- **Current Value**: `0`

### Rate Lookup: N30
- **Formula**: `=IFERROR(IF(AND(Output!C84>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C84,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D84),0),0)`
- **Current Value**: `49326.59223639`

### Rate Lookup: O30
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C84,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D84),0),0)`
- **Current Value**: `0`

### Rate Lookup: P30
- **Formula**: `=IFERROR(IF(AND(Output!C84>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C84,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D84),0),0)`
- **Current Value**: `98653.18447278`

### Rate Lookup: Q30
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C84,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D84),0),0)`
- **Current Value**: `0`

### Rate Lookup: N31
- **Formula**: `=IFERROR(IF(AND(Output!C85>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C85,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D85),0),0)`
- **Current Value**: `46548.18075285001`

### Rate Lookup: O31
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C85,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D85),0),0)`
- **Current Value**: `0`

### Rate Lookup: P31
- **Formula**: `=IFERROR(IF(AND(Output!C85>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C85,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D85),0),0)`
- **Current Value**: `93096.40822839`

### Rate Lookup: Q31
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C85,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D85),0),0)`
- **Current Value**: `0`

### Rate Lookup: N32
- **Formula**: `=IFERROR(IF(AND(Output!C86>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C86,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D86),0),0)`
- **Current Value**: `43850.31918687`

### Rate Lookup: O32
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C86,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D86),0),0)`
- **Current Value**: `0`

### Rate Lookup: P32
- **Formula**: `=IFERROR(IF(AND(Output!C86>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C86,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D86),0),0)`
- **Current Value**: `87700.68509643001`

### Rate Lookup: Q32
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C86,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D86),0),0)`
- **Current Value**: `0`

### Rate Lookup: N33
- **Formula**: `=IFERROR(IF(AND(Output!C87>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C87,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D87),0),0)`
- **Current Value**: `41233.00753845`

### Rate Lookup: O33
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C87,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D87),0),0)`
- **Current Value**: `0`

### Rate Lookup: P33
- **Formula**: `=IFERROR(IF(AND(Output!C87>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C87,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D87),0),0)`
- **Current Value**: `82466.0150769`

### Rate Lookup: Q33
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C87,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D87),0),0)`
- **Current Value**: `0`

### Rate Lookup: N34
- **Formula**: `=IFERROR(IF(AND(Output!C88>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C88,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D88),0),0)`
- **Current Value**: `38696.19908490001`

### Rate Lookup: O34
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C88,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D88),0),0)`
- **Current Value**: `0`

### Rate Lookup: P34
- **Formula**: `=IFERROR(IF(AND(Output!C88>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C88,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D88),0),0)`
- **Current Value**: `77392.44489248999`

### Rate Lookup: Q34
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C88,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D88),0),0)`
- **Current Value**: `0`

### Rate Lookup: N35
- **Formula**: `=IFERROR(IF(AND(Output!C89>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C89,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D89),0),0)`
- **Current Value**: `36239.94054891`

### Rate Lookup: O35
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C89,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D89),0),0)`
- **Current Value**: `0`

### Rate Lookup: P35
- **Formula**: `=IFERROR(IF(AND(Output!C89>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C89,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D89),0),0)`
- **Current Value**: `72479.88109782`

### Rate Lookup: Q35
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C89,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D89),0),0)`
- **Current Value**: `0`

### Rate Lookup: N36
- **Formula**: `=IFERROR(IF(AND(Output!C90>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C90,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D90),0),0)`
- **Current Value**: `33864.23193048`

### Rate Lookup: O36
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C90,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D90),0),0)`
- **Current Value**: `0`

### Rate Lookup: P36
- **Formula**: `=IFERROR(IF(AND(Output!C90>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C90,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D90),0),0)`
- **Current Value**: `67728.41713827002`

### Rate Lookup: Q36
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C90,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D90),0),0)`
- **Current Value**: `0`

### Rate Lookup: N37
- **Formula**: `=IFERROR(IF(AND(Output!C91>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C91,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D91),0),0)`
- **Current Value**: `31569.02650692`

### Rate Lookup: O37
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C91,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D91),0),0)`
- **Current Value**: `0`

### Rate Lookup: P37
- **Formula**: `=IFERROR(IF(AND(Output!C91>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C91,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D91),0),0)`
- **Current Value**: `63138.05301384`

### Rate Lookup: Q37
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C91,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D91),0),0)`
- **Current Value**: `0`

### Rate Lookup: N38
- **Formula**: `=IFERROR(IF(AND(Output!C92>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C92,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D92),0),0)`
- **Current Value**: `29354.371000920004`

### Rate Lookup: O38
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C92,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D92),0),0)`
- **Current Value**: `0`

### Rate Lookup: P38
- **Formula**: `=IFERROR(IF(AND(Output!C92>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C92,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D92),0),0)`
- **Current Value**: `58708.69527915`

### Rate Lookup: Q38
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C92,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D92),0),0)`
- **Current Value**: `0`

### Rate Lookup: N39
- **Formula**: `=IFERROR(IF(AND(Output!C93>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C93,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D93),0),0)`
- **Current Value**: `27220.218689790003`

### Rate Lookup: O39
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C93,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D93),0),0)`
- **Current Value**: `0`

### Rate Lookup: P39
- **Formula**: `=IFERROR(IF(AND(Output!C93>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C93,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D93),0),0)`
- **Current Value**: `54440.437379580006`

### Rate Lookup: Q39
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C93,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D93),0),0)`
- **Current Value**: `0`

### Rate Lookup: N40
- **Formula**: `=IFERROR(IF(AND(Output!C94>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C94,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D94),0),0)`
- **Current Value**: `25166.616296220003`

### Rate Lookup: O40
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C94,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D94),0),0)`
- **Current Value**: `0`

### Rate Lookup: P40
- **Formula**: `=IFERROR(IF(AND(Output!C94>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C94,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D94),0),0)`
- **Current Value**: `50333.27931513`

### Rate Lookup: Q40
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C94,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D94),0),0)`
- **Current Value**: `0`

### Rate Lookup: N41
- **Formula**: `=IFERROR(IF(AND(Output!C95>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C95,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D95),0),0)`
- **Current Value**: `23193.56382021`

### Rate Lookup: O41
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C95,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D95),0),0)`
- **Current Value**: `0`

### Rate Lookup: P41
- **Formula**: `=IFERROR(IF(AND(Output!C95>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C95,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D95),0),0)`
- **Current Value**: `46387.12764042`

### Rate Lookup: Q41
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C95,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D95),0),0)`
- **Current Value**: `0`

### Rate Lookup: N42
- **Formula**: `=IFERROR(IF(AND(Output!C96>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C96,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D96),0),0)`
- **Current Value**: `21301.01453907`

### Rate Lookup: O42
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C96,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D96),0),0)`
- **Current Value**: `0`

### Rate Lookup: P42
- **Formula**: `=IFERROR(IF(AND(Output!C96>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C96,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D96),0),0)`
- **Current Value**: `42602.07580083`

### Rate Lookup: Q42
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C96,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D96),0),0)`
- **Current Value**: `0`

### Rate Lookup: N43
- **Formula**: `=IFERROR(IF(AND(Output!C97>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C97,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D97),0),0)`
- **Current Value**: `19489.06189818`

### Rate Lookup: O43
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C97,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D97),0),0)`
- **Current Value**: `0`

### Rate Lookup: P43
- **Formula**: `=IFERROR(IF(AND(Output!C97>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C97,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D97),0),0)`
- **Current Value**: `38978.07707367001`

### Rate Lookup: Q43
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C97,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D97),0),0)`
- **Current Value**: `0`

### Rate Lookup: N44
- **Formula**: `=IFERROR(IF(AND(Output!C98>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C98,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D98),0),0)`
- **Current Value**: `17757.56572947`

### Rate Lookup: O44
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C98,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D98),0),0)`
- **Current Value**: `0`

### Rate Lookup: P44
- **Formula**: `=IFERROR(IF(AND(Output!C98>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C98,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D98),0),0)`
- **Current Value**: `35515.13145894`

### Rate Lookup: Q44
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C98,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D98),0),0)`
- **Current Value**: `0`

### Rate Lookup: N45
- **Formula**: `=IFERROR(IF(AND(Output!C99>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C99,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D99),0),0)`
- **Current Value**: `16106.66620101`

### Rate Lookup: O45
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C99,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D99),0),0)`
- **Current Value**: `0`

### Rate Lookup: P45
- **Formula**: `=IFERROR(IF(AND(Output!C99>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C99,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D99),0),0)`
- **Current Value**: `32213.28567933`

### Rate Lookup: Q45
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C99,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D99),0),0)`
- **Current Value**: `0`

### Rate Lookup: N46
- **Formula**: `=IFERROR(IF(AND(Output!C100>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C100,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D100),0),0)`
- **Current Value**: `14536.22314473`

### Rate Lookup: O46
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C100,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D100),0),0)`
- **Current Value**: `0`

### Rate Lookup: P46
- **Formula**: `=IFERROR(IF(AND(Output!C100>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C100,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D100),0),0)`
- **Current Value**: `29072.49301215`

### Rate Lookup: Q46
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C100,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D100),0),0)`
- **Current Value**: `0`

### Rate Lookup: N47
- **Formula**: `=IFERROR(IF(AND(Output!C101>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C101,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D101),0),0)`
- **Current Value**: `13046.376728700001`

### Rate Lookup: O47
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C101,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D101),0),0)`
- **Current Value**: `0`

### Rate Lookup: P47
- **Formula**: `=IFERROR(IF(AND(Output!C101>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C101,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D101),0),0)`
- **Current Value**: `26092.753457400002`

### Rate Lookup: Q47
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C101,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D101),0),0)`
- **Current Value**: `0`

### Rate Lookup: N48
- **Formula**: `=IFERROR(IF(AND(Output!C102>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C102,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D102),0),0)`
- **Current Value**: `11637.033507540002`

### Rate Lookup: O48
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C102,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D102),0),0)`
- **Current Value**: `0`

### Rate Lookup: P48
- **Formula**: `=IFERROR(IF(AND(Output!C102>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C102,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D102),0),0)`
- **Current Value**: `23274.11373777`

### Rate Lookup: Q48
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C102,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D102),0),0)`
- **Current Value**: `0`

### Rate Lookup: N49
- **Formula**: `=IFERROR(IF(AND(Output!C103>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C103,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D103),0),0)`
- **Current Value**: `10308.240203940002`

### Rate Lookup: O49
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C103,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D103),0),0)`
- **Current Value**: `0`

### Rate Lookup: P49
- **Formula**: `=IFERROR(IF(AND(Output!C103>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C103,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D103),0),0)`
- **Current Value**: `20616.52713057`

### Rate Lookup: Q49
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C103,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D103),0),0)`
- **Current Value**: `0`

### Rate Lookup: N50
- **Formula**: `=IFERROR(IF(AND(Output!C104>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C104,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D104),0),0)`
- **Current Value**: `9059.996817899999`

### Rate Lookup: O50
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C104,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D104),0),0)`
- **Current Value**: `0`

### Rate Lookup: P50
- **Formula**: `=IFERROR(IF(AND(Output!C104>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C104,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D104),0),0)`
- **Current Value**: `18119.993635799998`

### Rate Lookup: Q50
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C104,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D104),0),0)`
- **Current Value**: `0`

### Rate Lookup: N51
- **Formula**: `=IFERROR(IF(AND(Output!C105>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C105,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D105),0),0)`
- **Current Value**: `7892.25662673`

### Rate Lookup: O51
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C105,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D105),0),0)`
- **Current Value**: `0`

### Rate Lookup: P51
- **Formula**: `=IFERROR(IF(AND(Output!C105>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C105,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D105),0),0)`
- **Current Value**: `15784.51325346`

### Rate Lookup: Q51
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C105,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D105),0),0)`
- **Current Value**: `0`

### Rate Lookup: N52
- **Formula**: `=IFERROR(IF(AND(Output!C106>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C106,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D106),0),0)`
- **Current Value**: `6805.06635312`

### Rate Lookup: O52
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C106,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D106),0),0)`
- **Current Value**: `0`

### Rate Lookup: P52
- **Formula**: `=IFERROR(IF(AND(Output!C106>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C106,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D106),0),0)`
- **Current Value**: `13610.13270624`

### Rate Lookup: Q52
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C106,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D106),0),0)`
- **Current Value**: `0`

### Rate Lookup: N53
- **Formula**: `=IFERROR(IF(AND(Output!C107>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C107,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D107),0),0)`
- **Current Value**: `5798.37927438`

### Rate Lookup: O53
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C107,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D107),0),0)`
- **Current Value**: `0`

### Rate Lookup: P53
- **Formula**: `=IFERROR(IF(AND(Output!C107>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C107,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D107),0),0)`
- **Current Value**: `11596.80527145`

### Rate Lookup: Q53
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C107,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D107),0),0)`
- **Current Value**: `0`

### Rate Lookup: N54
- **Formula**: `=IFERROR(IF(AND(Output!C108>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C108,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D108),0),0)`
- **Current Value**: `4872.2421132`

### Rate Lookup: O54
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C108,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D108),0),0)`
- **Current Value**: `0`

### Rate Lookup: P54
- **Formula**: `=IFERROR(IF(AND(Output!C108>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C108,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D108),0),0)`
- **Current Value**: `9744.53094909`

### Rate Lookup: Q54
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C108,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D108),0),0)`
- **Current Value**: `0`

### Rate Lookup: N55
- **Formula**: `=IFERROR(IF(AND(Output!C109>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C109,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D109),0),0)`
- **Current Value**: `4026.6548695799997`

### Rate Lookup: O55
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C109,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D109),0),0)`
- **Current Value**: `0`

### Rate Lookup: P55
- **Formula**: `=IFERROR(IF(AND(Output!C109>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C109,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D109),0),0)`
- **Current Value**: `8053.3097391599995`

### Rate Lookup: Q55
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C109,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D109),0),0)`
- **Current Value**: `0`

### Rate Lookup: N56
- **Formula**: `=IFERROR(IF(AND(Output!C110>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C110,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D110),0),0)`
- **Current Value**: `3261.61754352`

### Rate Lookup: O56
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C110,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D110),0),0)`
- **Current Value**: `0`

### Rate Lookup: P56
- **Formula**: `=IFERROR(IF(AND(Output!C110>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C110,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D110),0),0)`
- **Current Value**: `6523.1883643500005`

### Rate Lookup: Q56
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C110,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D110),0),0)`
- **Current Value**: `0`

### Rate Lookup: N57
- **Formula**: `=IFERROR(IF(AND(Output!C111>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C111,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D111),0),0)`
- **Current Value**: `2577.08341233`

### Rate Lookup: O57
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C111,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D111),0),0)`
- **Current Value**: `0`

### Rate Lookup: P57
- **Formula**: `=IFERROR(IF(AND(Output!C111>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C111,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D111),0),0)`
- **Current Value**: `5154.120101970001`

### Rate Lookup: Q57
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C111,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D111),0),0)`
- **Current Value**: `0`

### Rate Lookup: N58
- **Formula**: `=IFERROR(IF(AND(Output!C112>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C112,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D112),0),0)`
- **Current Value**: `1973.05247601`

### Rate Lookup: O58
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C112,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D112),0),0)`
- **Current Value**: `0`

### Rate Lookup: P58
- **Formula**: `=IFERROR(IF(AND(Output!C112>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C112,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D112),0),0)`
- **Current Value**: `3946.10495202`

### Rate Lookup: Q58
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C112,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D112),0),0)`
- **Current Value**: `0`

### Rate Lookup: N59
- **Formula**: `=IFERROR(IF(AND(Output!C113>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C113,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D113),0),0)`
- **Current Value**: `1449.6181799400001`

### Rate Lookup: O59
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C113,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D113),0),0)`
- **Current Value**: `0`

### Rate Lookup: P59
- **Formula**: `=IFERROR(IF(AND(Output!C113>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C113,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D113),0),0)`
- **Current Value**: `2899.18963719`

### Rate Lookup: Q59
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C113,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D113),0),0)`
- **Current Value**: `0`

### Rate Lookup: N60
- **Formula**: `=IFERROR(IF(AND(Output!C114>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C114,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D114),0),0)`
- **Current Value**: `1006.6870787400001`

### Rate Lookup: O60
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C114,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D114),0),0)`
- **Current Value**: `0`

### Rate Lookup: P60
- **Formula**: `=IFERROR(IF(AND(Output!C114>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C114,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D114),0),0)`
- **Current Value**: `2013.3274347899999`

### Rate Lookup: Q60
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C114,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D114),0),0)`
- **Current Value**: `0`

### Rate Lookup: N61
- **Formula**: `=IFERROR(IF(AND(Output!C115>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C115,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D115),0),0)`
- **Current Value**: `644.25917241`

### Rate Lookup: O61
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C115,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D115),0),0)`
- **Current Value**: `0`

### Rate Lookup: P61
- **Formula**: `=IFERROR(IF(AND(Output!C115>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C115,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D115),0),0)`
- **Current Value**: `1288.51834482`

### Rate Lookup: Q61
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C115,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D115),0),0)`
- **Current Value**: `0`

### Rate Lookup: N62
- **Formula**: `=IFERROR(IF(AND(Output!C116>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C116,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D116),0),0)`
- **Current Value**: `362.38118364`

### Rate Lookup: O62
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C116,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D116),0),0)`
- **Current Value**: `0`

### Rate Lookup: P62
- **Formula**: `=IFERROR(IF(AND(Output!C116>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C116,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D116),0),0)`
- **Current Value**: `724.8090899700001`

### Rate Lookup: Q62
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C116,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D116),0),0)`
- **Current Value**: `0`

### Rate Lookup: N63
- **Formula**: `=IFERROR(IF(AND(Output!C117>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C117,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D117),0),0)`
- **Current Value**: `161.05311243`

### Rate Lookup: O63
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C117,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D117),0),0)`
- **Current Value**: `0`

### Rate Lookup: P63
- **Formula**: `=IFERROR(IF(AND(Output!C117>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C117,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D117),0),0)`
- **Current Value**: `322.15294755`

### Rate Lookup: Q63
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C117,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D117),0),0)`
- **Current Value**: `0`

### Rate Lookup: N64
- **Formula**: `=IFERROR(IF(AND(Output!C118>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C118,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D118),0),0)`
- **Current Value**: `40.27495878`

### Rate Lookup: O64
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C118,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D118),0),0)`
- **Current Value**: `0`

### Rate Lookup: P64
- **Formula**: `=IFERROR(IF(AND(Output!C118>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C118,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D118),0),0)`
- **Current Value**: `80.54991756`

### Rate Lookup: Q64
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C118,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D118),0),0)`
- **Current Value**: `0`

### Rate Lookup: N65
- **Formula**: `=IFERROR(IF(AND(Output!C119>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C119,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D119),0),0)`
- **Current Value**: `0`

### Rate Lookup: O65
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C119,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D119),0),0)`
- **Current Value**: `0`

### Rate Lookup: P65
- **Formula**: `=IFERROR(IF(AND(Output!C119>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C119,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D119),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q65
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C119,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D119),0),0)`
- **Current Value**: `0`

### Rate Lookup: N66
- **Formula**: `=IFERROR(IF(AND(Output!C120>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C120,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D120),0),0)`
- **Current Value**: `0`

### Rate Lookup: O66
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C120,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D120),0),0)`
- **Current Value**: `0`

### Rate Lookup: P66
- **Formula**: `=IFERROR(IF(AND(Output!C120>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C120,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D120),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q66
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C120,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D120),0),0)`
- **Current Value**: `0`

### Rate Lookup: N67
- **Formula**: `=IFERROR(IF(AND(Output!C121>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C121,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D121),0),0)`
- **Current Value**: `0`

### Rate Lookup: O67
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C121,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D121),0),0)`
- **Current Value**: `0`

### Rate Lookup: P67
- **Formula**: `=IFERROR(IF(AND(Output!C121>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C121,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D121),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q67
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C121,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D121),0),0)`
- **Current Value**: `0`

### Rate Lookup: N68
- **Formula**: `=IFERROR(IF(AND(Output!C122>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C122,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D122),0),0)`
- **Current Value**: `0`

### Rate Lookup: O68
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C122,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D122),0),0)`
- **Current Value**: `0`

### Rate Lookup: P68
- **Formula**: `=IFERROR(IF(AND(Output!C122>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C122,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D122),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q68
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C122,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D122),0),0)`
- **Current Value**: `0`

### Rate Lookup: N69
- **Formula**: `=IFERROR(IF(AND(Output!C123>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C123,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D123),0),0)`
- **Current Value**: `0`

### Rate Lookup: O69
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C123,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D123),0),0)`
- **Current Value**: `0`

### Rate Lookup: P69
- **Formula**: `=IFERROR(IF(AND(Output!C123>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C123,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D123),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q69
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C123,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D123),0),0)`
- **Current Value**: `0`

### Rate Lookup: N70
- **Formula**: `=IFERROR(IF(AND(Output!C124>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C124,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D124),0),0)`
- **Current Value**: `0`

### Rate Lookup: O70
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C124,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D124),0),0)`
- **Current Value**: `0`

### Rate Lookup: P70
- **Formula**: `=IFERROR(IF(AND(Output!C124>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C124,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D124),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q70
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C124,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D124),0),0)`
- **Current Value**: `0`

### Rate Lookup: N71
- **Formula**: `=IFERROR(IF(AND(Output!C125>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C125,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D125),0),0)`
- **Current Value**: `0`

### Rate Lookup: O71
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C125,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D125),0),0)`
- **Current Value**: `0`

### Rate Lookup: P71
- **Formula**: `=IFERROR(IF(AND(Output!C125>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C125,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D125),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q71
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C125,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D125),0),0)`
- **Current Value**: `0`

### Rate Lookup: N72
- **Formula**: `=IFERROR(IF(AND(Output!C126>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C126,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D126),0),0)`
- **Current Value**: `0`

### Rate Lookup: O72
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C126,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D126),0),0)`
- **Current Value**: `0`

### Rate Lookup: P72
- **Formula**: `=IFERROR(IF(AND(Output!C126>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C126,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D126),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q72
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C126,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D126),0),0)`
- **Current Value**: `0`

### Rate Lookup: N73
- **Formula**: `=IFERROR(IF(AND(Output!C127>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C127,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D127),0),0)`
- **Current Value**: `0`

### Rate Lookup: O73
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C127,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D127),0),0)`
- **Current Value**: `0`

### Rate Lookup: P73
- **Formula**: `=IFERROR(IF(AND(Output!C127>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C127,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D127),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q73
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C127,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D127),0),0)`
- **Current Value**: `0`

### Rate Lookup: N74
- **Formula**: `=IFERROR(IF(AND(Output!C128>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C128,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D128),0),0)`
- **Current Value**: `0`

### Rate Lookup: O74
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C128,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D128),0),0)`
- **Current Value**: `0`

### Rate Lookup: P74
- **Formula**: `=IFERROR(IF(AND(Output!C128>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C128,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D128),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q74
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C128,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D128),0),0)`
- **Current Value**: `0`

### Rate Lookup: N75
- **Formula**: `=IFERROR(IF(AND(Output!C129>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C129,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D129),0),0)`
- **Current Value**: `0`

### Rate Lookup: O75
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C129,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D129),0),0)`
- **Current Value**: `0`

### Rate Lookup: P75
- **Formula**: `=IFERROR(IF(AND(Output!C129>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C129,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D129),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q75
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C129,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D129),0),0)`
- **Current Value**: `0`

### Rate Lookup: N76
- **Formula**: `=IFERROR(IF(AND(Output!C130>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C130,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D130),0),0)`
- **Current Value**: `0`

### Rate Lookup: O76
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C130,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D130),0),0)`
- **Current Value**: `0`

### Rate Lookup: P76
- **Formula**: `=IFERROR(IF(AND(Output!C130>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C130,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D130),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q76
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C130,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D130),0),0)`
- **Current Value**: `0`

### Rate Lookup: N77
- **Formula**: `=IFERROR(IF(AND(Output!C131>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C131,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D131),0),0)`
- **Current Value**: `0`

### Rate Lookup: O77
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C131,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D131),0),0)`
- **Current Value**: `0`

### Rate Lookup: P77
- **Formula**: `=IFERROR(IF(AND(Output!C131>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C131,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D131),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q77
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C131,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D131),0),0)`
- **Current Value**: `0`

### Rate Lookup: N78
- **Formula**: `=IFERROR(IF(AND(Output!C132>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C132,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D132),0),0)`
- **Current Value**: `0`

### Rate Lookup: O78
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C132,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D132),0),0)`
- **Current Value**: `0`

### Rate Lookup: P78
- **Formula**: `=IFERROR(IF(AND(Output!C132>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C132,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D132),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q78
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C132,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D132),0),0)`
- **Current Value**: `0`

### Rate Lookup: N79
- **Formula**: `=IFERROR(IF(AND(Output!C133>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C133,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D133),0),0)`
- **Current Value**: `0`

### Rate Lookup: O79
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C133,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D133),0),0)`
- **Current Value**: `0`

### Rate Lookup: P79
- **Formula**: `=IFERROR(IF(AND(Output!C133>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C133,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D133),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q79
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C133,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D133),0),0)`
- **Current Value**: `0`

### Rate Lookup: N80
- **Formula**: `=IFERROR(IF(AND(Output!C134>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C134,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D134),0),0)`
- **Current Value**: `0`

### Rate Lookup: O80
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C134,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D134),0),0)`
- **Current Value**: `0`

### Rate Lookup: P80
- **Formula**: `=IFERROR(IF(AND(Output!C134>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C134,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D134),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q80
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C134,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D134),0),0)`
- **Current Value**: `0`

### Rate Lookup: N81
- **Formula**: `=IFERROR(IF(AND(Output!C135>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C135,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D135),0),0)`
- **Current Value**: `0`

### Rate Lookup: O81
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C135,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D135),0),0)`
- **Current Value**: `0`

### Rate Lookup: P81
- **Formula**: `=IFERROR(IF(AND(Output!C135>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C135,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D135),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q81
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C135,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D135),0),0)`
- **Current Value**: `0`

### Rate Lookup: N82
- **Formula**: `=IFERROR(IF(AND(Output!C136>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C136,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D136),0),0)`
- **Current Value**: `0`

### Rate Lookup: O82
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C136,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D136),0),0)`
- **Current Value**: `0`

### Rate Lookup: P82
- **Formula**: `=IFERROR(IF(AND(Output!C136>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C136,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D136),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q82
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C136,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D136),0),0)`
- **Current Value**: `0`

### Rate Lookup: N83
- **Formula**: `=IFERROR(IF(AND(Output!C137>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C137,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D137),0),0)`
- **Current Value**: `0`

### Rate Lookup: O83
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C137,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D137),0),0)`
- **Current Value**: `0`

### Rate Lookup: P83
- **Formula**: `=IFERROR(IF(AND(Output!C137>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C137,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D137),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q83
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C137,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D137),0),0)`
- **Current Value**: `0`

### Rate Lookup: N84
- **Formula**: `=IFERROR(IF(AND(Output!C138>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C138,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D138),0),0)`
- **Current Value**: `0`

### Rate Lookup: O84
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C138,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D138),0),0)`
- **Current Value**: `0`

### Rate Lookup: P84
- **Formula**: `=IFERROR(IF(AND(Output!C138>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C138,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D138),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q84
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C138,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D138),0),0)`
- **Current Value**: `0`

### Rate Lookup: N85
- **Formula**: `=IFERROR(IF(AND(Output!C139>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C139,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D139),0),0)`
- **Current Value**: `0`

### Rate Lookup: O85
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C139,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D139),0),0)`
- **Current Value**: `0`

### Rate Lookup: P85
- **Formula**: `=IFERROR(IF(AND(Output!C139>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C139,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D139),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q85
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C139,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D139),0),0)`
- **Current Value**: `0`

### Rate Lookup: N86
- **Formula**: `=IFERROR(IF(AND(Output!C140>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C140,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D140),0),0)`
- **Current Value**: `0`

### Rate Lookup: O86
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C140,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D140),0),0)`
- **Current Value**: `0`

### Rate Lookup: P86
- **Formula**: `=IFERROR(IF(AND(Output!C140>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C140,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D140),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q86
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C140,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D140),0),0)`
- **Current Value**: `0`

### Rate Lookup: N87
- **Formula**: `=IFERROR(IF(AND(Output!C141>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C141,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D141),0),0)`
- **Current Value**: `0`

### Rate Lookup: O87
- **Formula**: `=IFERROR(IF($O$6="True",VLOOKUP(Output!C141,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D141),0),0)`
- **Current Value**: `0`

### Rate Lookup: P87
- **Formula**: `=IFERROR(IF(AND(Output!C141>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C141,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D141),0),0)`
- **Current Value**: `0`

### Rate Lookup: Q87
- **Formula**: `=IFERROR(IF($Q$6="True",VLOOKUP(Output!C141,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D141),0),0)`
- **Current Value**: `0`

### Rate Lookup: I6
- **Formula**: `=VLOOKUP(Input!$D$6,Calc!$H$11:$I$13,2,FALSE)`
- **Current Value**: `LS`

### Rate Lookup: I7
- **Formula**: `=VLOOKUP(Input!$D$8,Calc!$H$15:$I$17,2,FALSE)`
- **Current Value**: `NSR`

### Rate Lookup: Mode
- **Formula**: `=VLOOKUP(Input!$D$18,$AH$7:$AI$10,2,FALSE)`
- **Current Value**: `12`

### Rate Lookup: ModalFactor
- **Formula**: `=VLOOKUP(Input!D18,Calc!AH7:AJ10,3,0)`
- **Current Value**: `0.0875`

### Rate Lookup: C23
- **Formula**: `=B23*VLOOKUP(Input!$D$18,$AH$6:$AJ$10,3,FALSE)`
- **Current Value**: `3893.5575`

### Rate Lookup: C26
- **Formula**: `=B26*VLOOKUP(Input!$D$18,$AH$6:$AJ$10,3,FALSE)`
- **Current Value**: `0`

### Rate Lookup: Y31
- **Formula**: `=IF(AND(Input!$D$10<>"Resident Indian",Input!$D$9="Medical"),((Input!$H$5*$B$9)/1000)*I4/I5,0)*VLOOKUP(Input!$D$18,$AH$6:$AJ$10,3,FALSE)`
- **Current Value**: `0`

## Full Logic Trace (By Sheet)

### Sheet: Calc
| Cell | Label | Simplified Logic | Value |
| --- | --- | --- | --- |
| Y2 | Y2 | =C23 | 3893.5575 |
| Z2 | Z2 | =C26 | 0 |
| AA2 | AA2 | =Y2+Z2 | 3893.5575 |
| B4 | B4 | =CONCATENATE(I2,I3,I4,I5,I6,I7,I22) | 26M5910LSNSR5000000 |
| C4 | C4 | =CONCATENATE(I2,I3,I4,I5,I6,I7,I22) | 26M5910LSNSR5000000 |
| D4 | D4 | =CONCATENATE(I2,I3,J4,I5,D3) | 26M5910ADB |
| B5 | B5 | =IFNA(VLOOKUP(B4,Medical_Rates,9,0),"") | 4.9442 |
| C5 | C5 | =IFNA(VLOOKUP(C4,Non_Medical_Rates,9,0),"") | 6.4275 |
| D5 | D5 | =VLOOKUP(D4,ADB_Rate,MATCH("Rate",ADB_Header,0),0) | 1.1103 |
| J4 | J4 | =IF(Input!D7="Yes",85-Age,PT) | 59 |
| AM2 | AM2 | =IFERROR(INDEX($AL$2:$AL$100,SMALL(IF($AL$2:$AL$100<>"",ROW($AL$1:$AL$99)), ROW(AL1))),"") | 5 |
| AM3 | AM3 | =IFERROR(INDEX($AL$2:$AL$100,SMALL(IF($AL$2:$AL$100<>"",ROW($AL$1:$AL$99)), ROW(AL2))),"") | 6 |
| AM4 | AM4 | =IFERROR(INDEX($AL$2:$AL$100,SMALL(IF($AL$2:$AL$100<>"",ROW($AL$1:$AL$99)), ROW(AL3))),"") | 10 |
| AL5 | AL5 | =IF(I4<12,"",IF(Age>63,"",12)) | 12 |
| AM5 | AM5 | =IFERROR(INDEX($AL$2:$AL$100,SMALL(IF($AL$2:$AL$100<>"",ROW($AL$1:$AL$99)), ROW(AL4))),"") | 12 |
| AL6 | AL6 | =IF(I4<15,"",IF(Age>60,"",15)) | 15 |
| AM6 | AM6 | =IFERROR(INDEX($AL$2:$AL$100,SMALL(IF($AL$2:$AL$100<>"",ROW($AL$1:$AL$99)), ROW(AL5))),"") | 15 |
| AL7 | AL7 | =IF(I4<20,"",IF(Age>55,"",20)) | 20 |
| AM7 | AM7 | =IFERROR(INDEX($AL$2:$AL$100,SMALL(IF($AL$2:$AL$100<>"",ROW($AL$1:$AL$99)), ROW(AL6))),"") | 20 |
| AL8 | AL8 | =IF(Input!D7="No",PT,"") | 59 |
| AM8 | AM8 | =IFERROR(INDEX($AL$2:$AL$100,SMALL(IF($AL$2:$AL$100<>"",ROW($AL$1:$AL$99)), ROW(AL7))),"") | 59 |
| AL9 | AL9 | =IF(AND(Input!D7="Yes",Age<=55),"Pay Till 60",IF(OR(Age>55,Age+I4<60),"",IF(Input!D7="Yes","Pay Till 60","Pay Till 60"))) | Pay Till 60 |
| AM9 | AM9 | =IFERROR(INDEX($AL$2:$AL$100,SMALL(IF($AL$2:$AL$100<>"",ROW($AL$1:$AL$99)), ROW(AL8))),"") | Pay Till 60 |
| AR5 | AR5 | =AND(OR(Input!D6="Life Shield",Input!D6="Life Shield Plus"),Input!D7="Yes") | False |
| AS5 | AS5 | =AND(OR(Input!D6="Life Shield",Input!D6="Life Shield Plus"),Input!D7="No") | True |
| AT5 | AT5 | =Input!D6="Life Shield ROP" | False |
| B6 | B6 | =IFNA(VLOOKUP(B4,Medical_Rates,10,0),"") | 0 |
| C6 | C6 | =IFNA(VLOOKUP(C4,Non_Medical_Rates,10,0),"") | 0 |
| B7 | B7 | =IF(AND(I6="LSR",SA<10000000),0,IF(AND(I6="LSR",SA>=10000000),1,VLOOKUP($B$10,'HSAR Factor'!$A$1:$F$97,6,0))) | 0 |
| C7 | C7 | =IF(AND(I6="LSR",SA<10000000),0,IF(AND(I6="LSR",SA>=10000000),1,VLOOKUP($B$10,'HSAR Factor'!$A$1:$F$97,6,0))) | 0 |
| E5 | E5 | =IF(AND(Input!E12="",Input!E10="",Input!E14="",Input!E17="",Input!E21="",Input!E22=""),IF(Input!D9="Medical",B5,C5),"") | 4.9442 |
| E6 | E6 | =IF(AND(Input!E12="",Input!E10="",Input!E14="",Input!E17="",Input!E21="",Input!E22=""),IF(Input!D9="Medical",B6*B7,C6*C7),"") | 0 |
| N6 | N6 | =IF(AND(Input!$H$8="Limited",Input!D6<>"Life Shield ROP"),"True","False") | True |
| O6 | O6 | =IF(Input!D6="Life Shield ROP","True","False") | False |
| P6 | P6 | =IF(AND(Input!$H$8="Limited",Input!D6<>"Life Shield ROP"),"True","False") | True |
| Q6 | Q6 | =IF(Input!D6="Life Shield ROP","True","False") | False |
| N7 | N7 | =IFERROR(IF(AND(Output!C61>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C61,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D61),0),0) | 0 |
| O7 | O7 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C61,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D61),0),0) | 0 |
| P7 | P7 | =IFERROR(IF(AND(Output!C61>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C61,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D61),0),0) | 0 |
| Q7 | Q7 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C61,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D61),0),0) | 0 |
| N8 | N8 | =IFERROR(IF(AND(Output!C62>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C62,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D62),0),0) | 0 |
| O8 | O8 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C62,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D62),0),0) | 0 |
| P8 | P8 | =IFERROR(IF(AND(Output!C62>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C62,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D62),0),0) | 0 |
| Q8 | Q8 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C62,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D62),0),0) | 0 |
| N9 | N9 | =IFERROR(IF(AND(Output!C63>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C63,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D63),0),0) | 0 |
| O9 | O9 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C63,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D63),0),0) | 0 |
| P9 | P9 | =IFERROR(IF(AND(Output!C63>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C63,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D63),0),0) | 0 |
| Q9 | Q9 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C63,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D63),0),0) | 0 |
| N10 | N10 | =IFERROR(IF(AND(Output!C64>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C64,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D64),0),0) | 0 |
| O10 | O10 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C64,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D64),0),0) | 0 |
| P10 | P10 | =IFERROR(IF(AND(Output!C64>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C64,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D64),0),0) | 0 |
| Q10 | Q10 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C64,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D64),0),0) | 0 |
| N11 | N11 | =IFERROR(IF(AND(Output!C65>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C65,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D65),0),0) | 0 |
| O11 | O11 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C65,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D65),0),0) | 0 |
| P11 | P11 | =IFERROR(IF(AND(Output!C65>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C65,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D65),0),0) | 0 |
| Q11 | Q11 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C65,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D65),0),0) | 0 |
| N12 | N12 | =IFERROR(IF(AND(Output!C66>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C66,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D66),0),0) | 0 |
| O12 | O12 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C66,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D66),0),0) | 0 |
| P12 | P12 | =IFERROR(IF(AND(Output!C66>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C66,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D66),0),0) | 0 |
| Q12 | Q12 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C66,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D66),0),0) | 0 |
| N13 | N13 | =IFERROR(IF(AND(Output!C67>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C67,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D67),0),0) | 0 |
| O13 | O13 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C67,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D67),0),0) | 0 |
| P13 | P13 | =IFERROR(IF(AND(Output!C67>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C67,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D67),0),0) | 0 |
| Q13 | Q13 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C67,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D67),0),0) | 0 |
| N14 | N14 | =IFERROR(IF(AND(Output!C68>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C68,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D68),0),0) | 0 |
| O14 | O14 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C68,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D68),0),0) | 0 |
| P14 | P14 | =IFERROR(IF(AND(Output!C68>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C68,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D68),0),0) | 0 |
| Q14 | Q14 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C68,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D68),0),0) | 0 |
| N15 | N15 | =IFERROR(IF(AND(Output!C69>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C69,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D69),0),0) | 0 |
| O15 | O15 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C69,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D69),0),0) | 0 |
| P15 | P15 | =IFERROR(IF(AND(Output!C69>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C69,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D69),0),0) | 0 |
| Q15 | Q15 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C69,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D69),0),0) | 0 |
| N16 | N16 | =IFERROR(IF(AND(Output!C70>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C70,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D70),0),0) | 96680.13199677001 |
| O16 | O16 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C70,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D70),0),0) | 0 |
| P16 | P16 | =IFERROR(IF(AND(Output!C70>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C70,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D70),0),0) | 193360.26399354002 |
| Q16 | Q16 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C70,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D70),0),0) | 0 |
| N17 | N17 | =IFERROR(IF(AND(Output!C71>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C71,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D71),0),0) | 92774.25528084 |
| O17 | O17 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C71,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D71),0),0) | 0 |
| P17 | P17 | =IFERROR(IF(AND(Output!C71>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C71,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D71),0),0) | 185548.55728437 |
| Q17 | Q17 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C71,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D71),0),0) | 0 |
| N18 | N18 | =IFERROR(IF(AND(Output!C72>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C72,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D72),0),0) | 88948.92848247 |
| O18 | O18 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C72,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D72),0),0) | 0 |
| P18 | P18 | =IFERROR(IF(AND(Output!C72>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C72,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D72),0),0) | 177897.90368763 |
| Q18 | Q18 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C72,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D72),0),0) | 0 |
| N19 | N19 | =IFERROR(IF(AND(Output!C73>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C73,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D73),0),0) | 85204.15160166 |
| O19 | O19 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C73,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D73),0),0) | 0 |
| P19 | P19 | =IFERROR(IF(AND(Output!C73>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C73,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D73),0),0) | 170408.30320332 |
| Q19 | Q19 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C73,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D73),0),0) | 0 |
| N20 | N20 | =IFERROR(IF(AND(Output!C74>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C74,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D74),0),0) | 81539.87791572 |
| O20 | O20 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C74,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D74),0),0) | 0 |
| P20 | P20 | =IFERROR(IF(AND(Output!C74>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C74,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D74),0),0) | 163079.75583144 |
| Q20 | Q20 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C74,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D74),0),0) | 0 |
| N21 | N21 | =IFERROR(IF(AND(Output!C75>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C75,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D75),0),0) | 77956.15414734001 |
| O21 | O21 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C75,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D75),0),0) | 0 |
| P21 | P21 | =IFERROR(IF(AND(Output!C75>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C75,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D75),0),0) | 155912.30829468003 |
| Q21 | Q21 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C75,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D75),0),0) | 0 |
| N22 | N22 | =IFERROR(IF(AND(Output!C76>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C76,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D76),0),0) | 74452.98029651999 |
| O22 | O22 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C76,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D76),0),0) | 0 |
| P22 | P22 | =IFERROR(IF(AND(Output!C76>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C76,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D76),0),0) | 148905.91387035002 |
| Q22 | Q22 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C76,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D76),0),0) | 0 |
| N23 | N23 | =IFERROR(IF(AND(Output!C77>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C77,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D77),0),0) | 71030.30964057 |
| O23 | O23 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C77,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D77),0),0) | 0 |
| P23 | P23 | =IFERROR(IF(AND(Output!C77>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C77,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D77),0),0) | 142060.61928114 |
| Q23 | Q23 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C77,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D77),0),0) | 0 |
| N24 | N24 | =IFERROR(IF(AND(Output!C78>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C78,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D78),0),0) | 67688.18890218 |
| O24 | O24 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C78,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D78),0),0) | 0 |
| P24 | P24 | =IFERROR(IF(AND(Output!C78>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C78,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D78),0),0) | 135376.33108167 |
| Q24 | Q24 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C78,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D78),0),0) | 0 |
| N25 | N25 | =IFERROR(IF(AND(Output!C79>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C79,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D79),0),0) | 64426.57135866 |
| O25 | O25 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C79,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D79),0),0) | 0 |
| P25 | P25 | =IFERROR(IF(AND(Output!C79>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C79,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D79),0),0) | 128853.14271732 |
| Q25 | Q25 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C79,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D79),0),0) | 0 |
| N26 | N26 | =IFERROR(IF(AND(Output!C80>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C80,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D80),0),0) | 61245.5037327 |
| O26 | O26 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C80,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D80),0),0) | 0 |
| P26 | P26 | =IFERROR(IF(AND(Output!C80>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C80,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D80),0),0) | 122491.0074654 |
| Q26 | Q26 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C80,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D80),0),0) | 0 |
| N27 | N27 | =IFERROR(IF(AND(Output!C81>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C81,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D81),0),0) | 58144.9860243 |
| O27 | O27 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C81,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D81),0),0) | 0 |
| P27 | P27 | =IFERROR(IF(AND(Output!C81>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C81,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D81),0),0) | 116289.9720486 |
| Q27 | Q27 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C81,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D81),0),0) | 0 |
| N28 | N28 | =IFERROR(IF(AND(Output!C82>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C82,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D82),0),0) | 55124.97151077 |
| O28 | O28 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C82,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D82),0),0) | 0 |
| P28 | P28 | =IFERROR(IF(AND(Output!C82>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C82,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D82),0),0) | 110249.98974423 |
| Q28 | Q28 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C82,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D82),0),0) | 0 |
| N29 | N29 | =IFERROR(IF(AND(Output!C83>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C83,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D83),0),0) | 52185.506914800004 |
| O29 | O29 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C83,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D83),0),0) | 0 |
| P29 | P29 | =IFERROR(IF(AND(Output!C83>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C83,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D83),0),0) | 104371.06055229 |
| Q29 | Q29 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C83,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D83),0),0) | 0 |
| N30 | N30 | =IFERROR(IF(AND(Output!C84>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C84,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D84),0),0) | 49326.59223639 |
| O30 | O30 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C84,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D84),0),0) | 0 |
| P30 | P30 | =IFERROR(IF(AND(Output!C84>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C84,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D84),0),0) | 98653.18447278 |
| Q30 | Q30 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C84,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D84),0),0) | 0 |
| N31 | N31 | =IFERROR(IF(AND(Output!C85>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C85,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D85),0),0) | 46548.18075285001 |
| O31 | O31 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C85,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D85),0),0) | 0 |
| P31 | P31 | =IFERROR(IF(AND(Output!C85>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C85,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D85),0),0) | 93096.40822839 |
| Q31 | Q31 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C85,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D85),0),0) | 0 |
| N32 | N32 | =IFERROR(IF(AND(Output!C86>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C86,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D86),0),0) | 43850.31918687 |
| O32 | O32 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C86,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D86),0),0) | 0 |
| P32 | P32 | =IFERROR(IF(AND(Output!C86>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C86,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D86),0),0) | 87700.68509643001 |
| Q32 | Q32 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C86,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D86),0),0) | 0 |
| N33 | N33 | =IFERROR(IF(AND(Output!C87>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C87,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D87),0),0) | 41233.00753845 |
| O33 | O33 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C87,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D87),0),0) | 0 |
| P33 | P33 | =IFERROR(IF(AND(Output!C87>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C87,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D87),0),0) | 82466.0150769 |
| Q33 | Q33 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C87,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D87),0),0) | 0 |
| N34 | N34 | =IFERROR(IF(AND(Output!C88>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C88,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D88),0),0) | 38696.19908490001 |
| O34 | O34 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C88,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D88),0),0) | 0 |
| P34 | P34 | =IFERROR(IF(AND(Output!C88>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C88,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D88),0),0) | 77392.44489248999 |
| Q34 | Q34 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C88,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D88),0),0) | 0 |
| N35 | N35 | =IFERROR(IF(AND(Output!C89>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C89,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D89),0),0) | 36239.94054891 |
| O35 | O35 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C89,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D89),0),0) | 0 |
| P35 | P35 | =IFERROR(IF(AND(Output!C89>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C89,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D89),0),0) | 72479.88109782 |
| Q35 | Q35 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C89,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D89),0),0) | 0 |
| N36 | N36 | =IFERROR(IF(AND(Output!C90>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C90,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D90),0),0) | 33864.23193048 |
| O36 | O36 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C90,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D90),0),0) | 0 |
| P36 | P36 | =IFERROR(IF(AND(Output!C90>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C90,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D90),0),0) | 67728.41713827002 |
| Q36 | Q36 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C90,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D90),0),0) | 0 |
| N37 | N37 | =IFERROR(IF(AND(Output!C91>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C91,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D91),0),0) | 31569.02650692 |
| O37 | O37 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C91,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D91),0),0) | 0 |
| P37 | P37 | =IFERROR(IF(AND(Output!C91>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C91,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D91),0),0) | 63138.05301384 |
| Q37 | Q37 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C91,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D91),0),0) | 0 |
| N38 | N38 | =IFERROR(IF(AND(Output!C92>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C92,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D92),0),0) | 29354.371000920004 |
| O38 | O38 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C92,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D92),0),0) | 0 |
| P38 | P38 | =IFERROR(IF(AND(Output!C92>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C92,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D92),0),0) | 58708.69527915 |
| Q38 | Q38 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C92,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D92),0),0) | 0 |
| N39 | N39 | =IFERROR(IF(AND(Output!C93>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C93,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D93),0),0) | 27220.218689790003 |
| O39 | O39 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C93,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D93),0),0) | 0 |
| P39 | P39 | =IFERROR(IF(AND(Output!C93>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C93,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D93),0),0) | 54440.437379580006 |
| Q39 | Q39 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C93,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D93),0),0) | 0 |
| N40 | N40 | =IFERROR(IF(AND(Output!C94>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C94,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D94),0),0) | 25166.616296220003 |
| O40 | O40 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C94,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D94),0),0) | 0 |
| P40 | P40 | =IFERROR(IF(AND(Output!C94>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C94,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D94),0),0) | 50333.27931513 |
| Q40 | Q40 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C94,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D94),0),0) | 0 |
| N41 | N41 | =IFERROR(IF(AND(Output!C95>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C95,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D95),0),0) | 23193.56382021 |
| O41 | O41 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C95,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D95),0),0) | 0 |
| P41 | P41 | =IFERROR(IF(AND(Output!C95>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C95,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D95),0),0) | 46387.12764042 |
| Q41 | Q41 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C95,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D95),0),0) | 0 |
| N42 | N42 | =IFERROR(IF(AND(Output!C96>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C96,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D96),0),0) | 21301.01453907 |
| O42 | O42 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C96,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D96),0),0) | 0 |
| P42 | P42 | =IFERROR(IF(AND(Output!C96>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C96,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D96),0),0) | 42602.07580083 |
| Q42 | Q42 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C96,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D96),0),0) | 0 |
| N43 | N43 | =IFERROR(IF(AND(Output!C97>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C97,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D97),0),0) | 19489.06189818 |
| O43 | O43 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C97,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D97),0),0) | 0 |
| P43 | P43 | =IFERROR(IF(AND(Output!C97>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C97,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D97),0),0) | 38978.07707367001 |
| Q43 | Q43 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C97,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D97),0),0) | 0 |
| N44 | N44 | =IFERROR(IF(AND(Output!C98>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C98,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D98),0),0) | 17757.56572947 |
| O44 | O44 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C98,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D98),0),0) | 0 |
| P44 | P44 | =IFERROR(IF(AND(Output!C98>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C98,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D98),0),0) | 35515.13145894 |
| Q44 | Q44 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C98,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D98),0),0) | 0 |
| N45 | N45 | =IFERROR(IF(AND(Output!C99>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C99,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D99),0),0) | 16106.66620101 |
| O45 | O45 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C99,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D99),0),0) | 0 |
| P45 | P45 | =IFERROR(IF(AND(Output!C99>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C99,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D99),0),0) | 32213.28567933 |
| Q45 | Q45 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C99,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D99),0),0) | 0 |
| N46 | N46 | =IFERROR(IF(AND(Output!C100>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C100,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D100),0),0) | 14536.22314473 |
| O46 | O46 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C100,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D100),0),0) | 0 |
| P46 | P46 | =IFERROR(IF(AND(Output!C100>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C100,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D100),0),0) | 29072.49301215 |
| Q46 | Q46 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C100,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D100),0),0) | 0 |
| N47 | N47 | =IFERROR(IF(AND(Output!C101>=Calc!$H$30,$N$6="True"),VLOOKUP(Output!C101,gsvv1,MATCH(Calc!$I$28,'GSV Ann II.1'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D101),0),0) | 13046.376728700001 |
| O47 | O47 | =IFERROR(IF($O$6="True",VLOOKUP(Output!C101,gsvv2,MATCH(Calc!$I$28,'GSV Ann II.3'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D101),0),0) | 0 |
| P47 | P47 | =IFERROR(IF(AND(Output!C101>=Calc!$H$30,$P$6="True"),VLOOKUP(Output!C101,ssvv1,MATCH(Calc!$I$28,'SSV Ann II.2'!$A$5:$BU$5,0),FALSE)*SUM(Output!$D$61:D101),0),0) | 26092.753457400002 |
| Q47 | Q47 | =IFERROR(IF($Q$6="True",VLOOKUP(Output!C101,ssvv2,MATCH(Calc!$I$28,'SSV Ann II.4'!$A$5:$BL$5,0),FALSE)*SUM(Output!$D$61:D101),0),0) | 0 |
