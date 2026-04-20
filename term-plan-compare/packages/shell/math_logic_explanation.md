# Mathematical Logic Extraction

### E17 (Input!E17)
- **Logic**: `=IF(OR(AND(D6="Life Shield ROP",Calc!I4>Calc!I5,Calc!I4-Calc!I5<5),Calc!I4<Calc!I5,AND(D6="Life Shield ROP",D17="Pay Till 60",Age<25)),"Premium Payment Term Is Not Valid","")`
- **Value**: ``
- **Raw Formula**: `=IF(OR(AND(D6="Life Shield ROP",Calc!$I$4>Calc!$I$5,Calc!$I$4-Calc!$I$5<5),Calc!$I$4<Calc!$I$5,AND(D6="Life Shield ROP",D17="Pay Till 60",Age<25)),"Premium Payment Term Is Not Valid","")`

### Eligible SA (Input!H20)
- **Logic**: `=VLOOKUP(Age,Calc!AW5:AX11,2,TRUE)`
- **Value**: `25`
- **Raw Formula**: `=VLOOKUP(Age,Calc!$AW$5:$AX$11,2,TRUE)`

