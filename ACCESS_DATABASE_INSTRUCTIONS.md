# How to Create Access Database (.accdb) from School Data

## Method 1: Using Microsoft Access (Recommended)

### Step 1: Open Microsoft Access
1. Open Microsoft Access
2. Click "Blank database"
3. Name it "SCHOOL_DATABASE.accdb"
4. Click "Create"

### Step 2: Import CSV Data
1. Go to "External Data" tab
2. Click "Text File" in Import & Link group
3. Browse and select "SCHOOL_DATA.csv"
4. Choose "Import the source data into a new table"
5. Click "OK"

### Step 3: Configure Import Settings
1. Choose "Delimited" format
2. Select "Comma" as delimiter
3. Check "First Row Contains Field Names"
4. Click "Next"

### Step 4: Set Field Properties
Configure each field:
- **SCHOOL_ID**: Number (Long Integer), Primary Key
- **STUDENT_TEACHER_NAME**: Text (200 characters)
- **PHONE_NUMBER**: Text (20 characters)
- **EGN**: Text (10 characters)
- **ROLE**: Text (100 characters)
- **EMAIL**: Text (100 characters), Indexed (No Duplicates)

### Step 5: Finish Import
1. Name the table "SCHOOL_DATA"
2. Check "Let Access add primary key" (uncheck if SCHOOL_ID is already set)
3. Click "Finish"

## Method 2: Using VBA Script (Advanced)

Create a new Access database and run this VBA code:

```vba
Sub CreateSchoolDataTable()
    Dim db As Database
    Dim tdf As TableDef
    Dim fld As Field
    
    Set db = CurrentDb()
    
    ' Create table definition
    Set tdf = db.CreateTableDef("SCHOOL_DATA")
    
    ' Add fields
    Set fld = tdf.CreateField("SCHOOL_ID", dbLong)
    fld.Attributes = dbAutoIncrField
    tdf.Fields.Append fld
    
    Set fld = tdf.CreateField("STUDENT_TEACHER_NAME", dbText, 200)
    tdf.Fields.Append fld
    
    Set fld = tdf.CreateField("PHONE_NUMBER", dbText, 20)
    tdf.Fields.Append fld
    
    Set fld = tdf.CreateField("EGN", dbText, 10)
    tdf.Fields.Append fld
    
    Set fld = tdf.CreateField("ROLE", dbText, 100)
    tdf.Fields.Append fld
    
    Set fld = tdf.CreateField("EMAIL", dbText, 100)
    tdf.Fields.Append fld
    
    ' Append table to database
    db.TableDefs.Append tdf
    
    ' Create primary key
    Dim idx As Index
    Set idx = tdf.CreateIndex("PrimaryKey")
    idx.Primary = True
    Set fld = idx.CreateField("SCHOOL_ID")
    idx.Fields.Append fld
    tdf.Indexes.Append idx
    
    MsgBox "Table created successfully!"
End Sub
```

## Method 3: Using SQL in Access

1. Open Access and create blank database
2. Go to "Create" > "Query Design"
3. Close the "Show Table" dialog
4. Go to "Design" > "SQL View"
5. Paste this SQL:

```sql
CREATE TABLE SCHOOL_DATA (
    SCHOOL_ID COUNTER PRIMARY KEY,
    STUDENT_TEACHER_NAME TEXT(200) NOT NULL,
    PHONE_NUMBER TEXT(20),
    EGN TEXT(10) NOT NULL,
    ROLE TEXT(100) NOT NULL,
    EMAIL TEXT(100) NOT NULL
);

CREATE UNIQUE INDEX idx_email ON SCHOOL_DATA (EMAIL);
```

6. Run the query
7. Import CSV data using External Data > Text File

## Validation Rules (Optional)

Add these validation rules in Access:

### For EGN field:
- Validation Rule: `Len([EGN])=10`
- Validation Text: "EGN must be exactly 10 digits"

### For EMAIL field:
- Validation Rule: `[EMAIL] Like "*@*.??*"`
- Validation Text: "Please enter a valid email address"

### For ROLE field:
- Validation Rule: `[ROLE] In ("5A","5B","6A","6B","7A","7B","8A","8B","9A","9B","10A","10B","11A","11B","12A","12B","MATHEMATICS","BULGARIAN","ENGLISH","HISTORY","GEOGRAPHY","BIOLOGY","CHEMISTRY","PHYSICS","PHYSICAL_EDUCATION","ART","MUSIC","TECHNOLOGY","COMPUTER_SCIENCE","GERMAN","FRENCH","PHILOSOPHY","PSYCHOLOGY","ADMINISTRATOR")`
- Validation Text: "Invalid role specified"

## Final Database Structure

Your Access database will contain:
- **515 total records** (35 teachers + 480 students)
- **Grades 5-12** (8 grades × 2 classes × 30 students = 480 students)
- **All major subjects** covered by specialized teachers
- **Realistic Bulgarian names** and EGN numbers
- **School email format** for easy identification

## Usage in Your Application

The database can be:
1. **Exported to CSV** for import into PostgreSQL
2. **Connected directly** via ODBC drivers
3. **Queried via SQL** for user validation
4. **Updated regularly** by school administration

This structure matches your plan requirements for email validation and role-based access control.