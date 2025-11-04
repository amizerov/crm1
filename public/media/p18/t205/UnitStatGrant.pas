unit UnitStatGrant;

interface

uses
  Windows, Messages, SysUtils, Variants, Classes, Graphics, Controls, Forms,
  Dialogs, ComCtrls, StdCtrls, DB, ADODB,COMObj, Grids, DBGrids, DBCtrls,
  ExtCtrls, Mask,Math,DateUtils;

type
  TFormStat_Grant = class(TForm)
    Label2: TLabel;
    RadioGroup1: TRadioGroup;
    DBGrid1: TDBGrid;
    Button2: TButton;
    Button1: TButton;
    DataSource3: TDataSource;
    ADOQueryFirm: TADOQuery;
    ADOQueryFirmNFirm: TIntegerField;
    ADOQueryFirmFirm_Name: TWideStringField;
    QServ: TADOQuery;
    CSQL: TADOCommand;
    ADOQueryFirm_Name: TADOQuery;
    ADOQueryFirm_NameFirm_Name: TWideStringField;
    ADOQueryFirm_NameNFirm: TIntegerField;
    ProgBar: TProgressBar;
    LabeledEdit1: TLabeledEdit;
    ADOQueryGrant: TADOQuery;
    ADOQueryGrantAc: TADOQuery;
    ADOQueryGrantAcSumAc: TIntegerField;
    ADOQueryGrantAcSumAc0: TIntegerField;
    ADOQueryGrantAcSumAc1: TIntegerField;
    ADOQueryGrantAcSumAc2: TIntegerField;
    ADOQueryGrantCOLUMN1: TIntegerField;
    Label1: TLabel;
    LabeledEdit2: TLabeledEdit;
    Label3: TLabel;
    ComboBox1: TComboBox;
    ADOQueryGrantOld: TADOQuery;
    ADOQueryGrantOldbak1: TIntegerField;
    ADOQueryGrantOldbak2: TIntegerField;
    ADOQueryGrantOldbak3: TIntegerField;
    ADOQueryGrantOldbak4: TIntegerField;
    ADOQueryGrantOldspec1: TIntegerField;
    ADOQueryGrantOldspec2: TIntegerField;
    ADOQueryGrantOldspec3: TIntegerField;
    ADOQueryGrantOldspec4: TIntegerField;
    ADOQueryGrantOldspec5: TIntegerField;
    ADOQueryGrantOldmag1: TIntegerField;
    ADOQueryGrantOldmag2: TIntegerField;
    procedure FormShow(Sender: TObject);
    procedure RadioGroup1Click(Sender: TObject);
    procedure Button2Click(Sender: TObject);
    procedure CopyRow(TRNum:String);
    procedure RunSQL(const SQL:String);
    procedure DropTempTabl(const TabName:String);
    procedure StatGrant;
    procedure FormClose(Sender: TObject; var Action: TCloseAction);
    procedure Button2Enter(Sender: TObject);
    function GetIntField(const sSQL:string):Integer;
    procedure Button1Click(Sender: TObject);
  private
   XL,WB,WS:Variant;
    { Private declarations }
  public
    { Public declarations }
  end;

var
  FormStat_Grant: TFormStat_Grant;

implementation
 uses Unit1;
 var cr:Integer;TFPath:String;
{$R *.dfm}

procedure TFormStat_Grant.CopyRow(TRNum:String);
const xlDown:Integer=-4121;
var s,n:String;
begin
s:=TRNum;
WS.Rows[s].Copy;
n:=IntToStr(cr+0);
s:=n+':'+n;
WS.Rows[s].Insert(xlDown);
end;

procedure TFormStat_Grant.RunSQL(const SQL:String);
begin
CSQL.CommandText:=SQL;
CSQL.Execute;
end;

function TFormStat_Grant.GetIntField(const sSQL:string):Integer;
begin
 Result:=0;
 with QServ do
  begin
   if Active then Close; SQL.Clear;
   SQL.Add(sSQL);
   Open;
   if not Eof then Result:=Fields[0].AsInteger;
   Close;
  end;
end;

procedure TFormStat_Grant.DropTempTabl(const TabName:String);
begin
try
  CSQL.CommandText:='DROP TABLE '+TabName;
  CSQL.Execute;
except
end;
end;

procedure TFormStat_Grant.FormShow(Sender: TObject);
begin
  RadioGroup1.ItemIndex := 0;
  LabeledEdit1.Visible := false;
  LabeledEdit2.Text := IntToStr(YearOf(Date()));
//  LabeledEdit2.ReadOnly := true;
  ComboBox1.ItemIndex := 0;
  DBGrid1.Visible := true;
  ADOQueryFirm.Close;
  ADOQueryFirm.Open;
end;

procedure TFormStat_Grant.RadioGroup1Click(Sender: TObject);
begin
 if RadioGroup1.ItemIndex = 0 then
  begin
   DBGrid1.Visible := true;
   LabeledEdit1.Visible := false;
   ADOQueryFirm.Close;
   ADOQueryFirm.Open;
  end
 else
  DBGrid1.Visible := false;
end;

procedure TFormStat_Grant.Button2Click(Sender: TObject);
begin
// Проверяем наличие шаблона
 TFPath:=ExtractFilePath(Application.ExeName)+'StudSt.xlt';
 if FileExists(TFPath)=False then
 begin
  ShowMessage('    Файл StudSt.xlt не найден !    ');
  Exit;
 end;
 StatGrant;
end;

procedure TFormStat_Grant.StatGrant;
var NFirm,i,j,God,Amount,Amount1,CountSt,SumHelp,mn,mk,mt,GodEnter: integer;
var s,s1,s2,s3,month,old1,old2,old3,oc: string;
var ss1,ss2,ss3,str1,str2,str3,str4,str5,str6: string;
var Date1,Date2: string;
label 99,98;
 begin
 if RadioGroup1.ItemIndex = 0 then
 if ((DBGrid1.SelectedRows.Count = 0) and Form1.Admin) then begin
  ShowMessage('Пожалуйста, укажите факультет');
  Exit;
  end;
 if TRIM(LabeledEdit2.Text) = '' then begin
  ShowMessage('Пожалуйста, укажите год');
  Exit;
  end;
 if VarIsEmpty(XL) then XL:=CreateOleObject('Excel.Application');
  try
  NFirm := ADOQueryFirmNFirm.Value;
  XL.Visible:=False;
  WB:=XL.Workbooks.Add(TFPath);
  WS:=WB.Worksheets['StatGrant'];
  WS.Visible:=True;
  WS.Select;
  God := StrToInt(LabeledEdit2.Text);
  ProgBar.Visible:=True;
  with ADOQueryFirm do begin
  if RadioGroup1.ItemIndex = 0 then
   LabeledEdit1.Text := TRIM(ADOQueryFirmFirm_Name.Text)
  else LabeledEdit1.Text := 'По МГУ';
  LabeledEdit1.Refresh;
  WS.Cells[4,1]:= TRIM(LabeledEdit1.Text);
  WS.Cells[5,12]:= IntToStr(God)+ ' год';
  if ComboBox1.ItemIndex  = 0 then begin mn := 1; mk := 6; end;
  if ComboBox1.ItemIndex  = 1 then begin mn := 7; mk := 12; end;
  if ComboBox1.ItemIndex  = 2 then begin mn := 1; mk := 12; end;
  ProgBar.Position:=0;
  for i := mn to mk do
   begin
    if i = 1 then GodEnter := God - 1 else GodEnter := God;
    ProgBar.Position := ProgBar.Position + 1;
    month:=IntToStr(i); if Length(month)<2 then month:='0'+month;
    s := 'SELECT PrK_Entrant,PrK_Person,Entrant.NFirm AS NFirm,PrK_Status_Type,Num_Term,'+
    'Cat = CASE CAST(FK_Type AS nchar(1))+CAST(FK_Type_Spec AS nchar(1))'+
    ' WHEN ''12'' THEN 1 WHEN ''11'' THEN 2 ELSE 3 END,FK_Order_Wording,FK_Country,Enter_Institute,Status.Kurs INTO #TSt'+
    ' FROM Entrant'+
    ' INNER JOIN Person ON Entrant.FK_Person = PrK_Person'+
    ' INNER JOIN Finance ON Entrant.FK_Finance=PrK_Finance AND ((PrK_Finance=21) OR (PrK_Finance=23) OR (PrK_Finance=48))'+
    ' INNER JOIN Spec ON Entrant.FK_Spec = PrK_Spec'+
    ' INNER JOIN Group_Stud ON Entrant.FK_Group_Stud = PrK_Group_Stud'+
    ' AND Group_Stud.NFirm = Entrant.NFirm AND Group_Stud.Owner = Entrant.Owner_Group'+
    ' INNER JOIN Plan_Year_Enter ON Group_Stud.FK_Plan_Year = PrK_Plan_Year AND Plan_Year_Enter.NFirm = Group_Stud.NFirm'+
    ' INNER JOIN Educ_Plan ON Plan_Year_Enter.FK_Plan = PrK_Plan AND Educ_Plan.NFirm = Plan_Year_Enter.NFirm'+
    ' INNER JOIN Status ON Status.FK_Entrant=PrK_Entrant AND Status.Nfirm = Entrant.NFirm'+
    ' AND Status.Start_Date=(SELECT MAX(Start_Date) FROM Status,Order_Doc'+
    ' WHERE FK_Entrant=PrK_Entrant AND Status.FK_Order=PrK_Order_Doc AND Order_Doc.NFirm = Status.NFirm'+
    ' AND Order_Status=1 AND Order_Doc.Owner=Status.Owner'+
    ' AND Status.Start_Date <= ''15.'+ month +'.'+ IntToStr(God)+''')'+
    ' INNER JOIN Order_Doc ON Status.FK_Order=PrK_Order_Doc AND Order_Doc.NFirm = Status.NFirm'+
    ' AND Order_Status=1 AND Order_Doc.Owner=Status.Owner'+
    ' INNER JOIN Status_Type ON Status.FK_Status_Type = PrK_Status_Type'+
    ' AND PrK_Status_Type <> 7 AND PrK_Status_Type <> 8'+
    ' INNER JOIN Person_Doc ON Person_Doc.FK_Person = PrK_Person'+
    ' AND Person_Doc.FK_Doc_Kind IN (SELECT PrK_Doc_Kind FROM Doc_Kind WHERE FK_Doc_Type = 1)'+
    ' INNER JOIN Union_Status_Union_Insp ON Union_Status_Union_Insp.FK_Union_Insp = Plan_Year_Enter.FK_Insp'+
    ' AND Union_Status_Union_Insp.Year_Insp = Plan_Year_Enter.Year_Enter';

  if RadioGroup1.ItemIndex = 1 then
   RunSQL(s)
  else RunSQL(s + ' AND Entrant.NFirm='+IntToStr(NFirm));
  ProgBar.Position := ProgBar.Position + 1;
  WS.Cells[7,5+i]:= GetIntField('SELECT Count(PrK_Entrant) FROM #TSt');
  ProgBar.Position := ProgBar.Position + 1;
  Amount := GetIntField('SELECT Count(PrK_Entrant) FROM #TSt WHERE Cat = 1');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[8,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(PrK_Entrant) FROM #TSt WHERE Cat = 2');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[9,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(PrK_Entrant) FROM #TSt WHERE Cat = 3');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[10,5+i]:= Amount;

//Студенты, получающие академическую стипендию в этом году в указанном месяце
  s1 := 'SELECT #TSt.PrK_Entrant,#TSt.PrK_Person,PrK_Order_Doc,FK_Grant_Type_Charge,Cat,'+
  '#TSt.FK_Order_Wording,FK_Country,Term_Grant,Enter_Institute,Kurs'+
  ' INTO #TAc FROM #TSt'+
  ' INNER JOIN Grant_Stud ON Grant_Stud.FK_Entrant = #TSt.PrK_Entrant'+
  ' AND Grant_Stud.NFirm = #TSt.NFirm AND Grant_Stud.FK_Grant_Type = 1'+
  ' AND Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God)+''''+
  ' INNER JOIN Order_Doc ON Grant_Stud.FK_Order_Doc=Order_Doc.PrK_Order_Doc'+
  ' AND Order_Doc.NFirm = #TSt.NFirm AND Order_Doc.Order_Status=1';
  RunSQL(s1);

// Кол-во оценок "отлично" и "хорошо" в сессии
  oc := 'SELECT PrK_Entrant,CAST(RTRIM(Mark_Result) AS NCHAR(1)) AS Mark'+
  ' INTO #T45 FROM #TAc'+
  ' INNER JOIN Mark ON Mark.FK_Entrant = PrK_Entrant'+
  ' AND Term_Num = Term_Grant - 1 AND FK_Educ_Account = 1'+
  ' WHERE ((RTRIM(Mark_Result) = ''5'') OR (RTRIM(Mark_Result) = ''4''))'+
  ' SELECT PrK_Entrant,Oc5=(SELECT SUM(CASE Mark WHEN 5 THEN 1 ELSE 0 END)),'+
  ' Oc4=(SELECT SUM(CASE Mark WHEN 4 THEN 1 ELSE 0 END))'+
  ' INTO #TOc FROM #T45 Group By PrK_Entrant DROP TABLE #T45';
  RunSQL(oc);

// Кол-во оценок и кол-во зачетов в сессии
  oc := 'SELECT PrK_Entrant,COUNT(Mark) AS QMark,'+
  ' Test=(SELECT SUM(CASE FK_Educ_Account WHEN 3 THEN 1 ELSE 0 END))'+
  ' INTO #TTest FROM #TAc'+
  ' INNER JOIN Mark ON Mark.FK_Entrant = PrK_Entrant'+
  ' AND Term_Num = Term_Grant - 1 Group By PrK_Entrant';
 RunSQL(oc);

//Студенты, получающие академическую стипендию в предыдущие года в указанном месяце, сдавшие сессию на "отлично"
  old1 := 'SELECT PrK_Entrant,Cat,Year(Pay_End_Date) AS YearOld'+
  ' INTO #TOld1 FROM #TAc'+
  ' INNER JOIN Grant_Stud ON Grant_Stud.FK_Entrant = PrK_Entrant'+
  ' AND Grant_Stud.FK_Grant_Type = 1'+
  ' AND Grant_Stud.FK_Grant_Type_Charge = 1'+
  ' AND ((Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God)+''')'+
  ' OR (Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God-1)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God-1)+''')'+
  ' OR (Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God-2)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God-2)+''')'+
  ' OR (Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God-3)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God-3)+'''))'+
  ' INNER JOIN Order_Doc ON Grant_Stud.FK_Order_Doc=Order_Doc.PrK_Order_Doc'+
  ' AND Order_Doc.NFirm = Grant_Stud.NFirm AND Order_Doc.Order_Status=1'+
  ' WHERE  Cat = 1 AND #TAc.FK_Grant_Type_Charge = 1';
  RunSQL(old1);

  old2 := 'SELECT PrK_Entrant,Cat,Year(Pay_End_Date) AS YearOld'+
  ' INTO #TOld2 FROM #TAc'+
  ' INNER JOIN Grant_Stud ON Grant_Stud.FK_Entrant = PrK_Entrant'+
  ' AND Grant_Stud.FK_Grant_Type = 1'+
  ' AND Grant_Stud.FK_Grant_Type_Charge = 1'+
  ' AND ((Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God)+''')'+
  ' OR (Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God-1)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God-1)+''')'+
  ' OR (Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God-2)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God-2)+''')'+
  ' OR (Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God-3)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God-3)+''')'+
  ' OR (Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God-4)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God-4)+'''))'+
  ' INNER JOIN Order_Doc ON Grant_Stud.FK_Order_Doc=Order_Doc.PrK_Order_Doc'+
  ' AND Order_Doc.NFirm = Grant_Stud.NFirm AND Order_Doc.Order_Status=1'+
  ' WHERE Cat = 2 AND #TAc.FK_Grant_Type_Charge = 1';
  RunSQL(old2);

  old3 := 'SELECT PrK_Entrant,Cat,Year(Pay_End_Date) AS YearOld'+
  ' INTO #TOld3 FROM #TAc'+
  ' INNER JOIN Grant_Stud ON Grant_Stud.FK_Entrant = PrK_Entrant'+
  ' AND Grant_Stud.FK_Grant_Type = 1'+
  ' AND Grant_Stud.FK_Grant_Type_Charge = 1'+
  ' AND ((Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God)+''')'+
  ' OR (Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God-1)+''''+
  ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God-1)+'''))'+
  ' INNER JOIN Order_Doc ON Grant_Stud.FK_Order_Doc=Order_Doc.PrK_Order_Doc'+
  ' AND Order_Doc.NFirm = Grant_Stud.NFirm AND Order_Doc.Order_Status=1'+
  ' WHERE Cat = 3 AND #TAc.FK_Grant_Type_Charge = 1';
  RunSQL(old3);

  ss1 := 'за все промежуточные аттестации '; ss2 := ' учебного года'; ss3 := ' учебных лет';
  str1 := IntToStr(God-1) +'/' +IntToStr(God);
  str2 := IntToStr(God-2) +'/' +IntToStr(God-1);
  str3 := IntToStr(God-3) +'/' +IntToStr(God-2);
  str4 := IntToStr(God-4) +'/' +IntToStr(God-3);
  str5 := IntToStr(God-5) +'/' +IntToStr(God-4);
  WS.Cells[46,1] := ss1 +str1 + ss2;
  WS.Cells[47,1] := ss1 +str1 + ' и ' + str2 + ss3;
  WS.Cells[48,1] := ss1 +str1 + ',' + str2 + ' и ' + str3 + ss3;
  WS.Cells[49,1] := ss1 +str1 + ',' + str2 + ',' + str3 + ' и ' + str4 + ss3;
  WS.Cells[51,1] := ss1 +str1 + ss2;
  WS.Cells[52,1] := ss1 +str1 + ' и ' + str2 + ss3;
  WS.Cells[54,1] := ss1 +str1 + ss2;
  WS.Cells[55,1] := ss1 +str1 + ' и ' + str2 + ss3;
  WS.Cells[56,1] := ss1 +str1 + ',' + str2 + ' и ' + str3 + ss3;
  WS.Cells[57,1] := ss1 +str1 + ',' + str2 + ',' + str3 + ' и ' + str4 + ss3;
  WS.Cells[58,1] := ss1 +str1 + ',' + str2 + ',' + str3 + ',' + str4 + ' и ' + str5 + ss3;

  ProgBar.Position := ProgBar.Position + 1;
  Amount := GetIntField('SELECT Count(PrK_Entrant) FROM #TAc');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[11,5+i]:= Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=3');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[12,5+i] := Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=3 AND Cat = 1');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[13,5+i] := Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=3 AND Cat = 2');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[14,5+i] := Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=3 AND Cat = 3');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[15,5+i] := Amount;
  Amount :=  GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=2');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[16,5+i] := Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=2 AND Cat = 1');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[17,5+i] := Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=2 AND Cat = 2');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[18,5+i] := Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=2 AND Cat = 3');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[19,5+i] := Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=1');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[20,5+i] := Amount;
  ProgBar.Position := ProgBar.Position + 1;
  Amount := GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=1 AND Cat = 1');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[21,5+i] := Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #Told1 WHERE YearOld ='+IntToStr(God));
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[46,5+i]:= Amount;
  Amount1 := GetIntField('SELECT COUNT(*) FROM #Told1 WHERE YearOld='+IntToStr(God-1));
  ProgBar.Position := ProgBar.Position + 1;
  Amount := Amount + Amount1;
  if Amount > 0 then WS.Cells[47,5+i]:= Amount;
  Amount1 := GetIntField('SELECT COUNT(*) FROM #Told1 WHERE YearOld='+IntToStr(God-2));
  ProgBar.Position := ProgBar.Position + 1;
  Amount := Amount + Amount1;
  if Amount > 0 then WS.Cells[48,5+i]:= Amount;
  Amount1 := GetIntField('SELECT COUNT(*) FROM #Told1 WHERE YearOld='+IntToStr(God-3));
  ProgBar.Position := ProgBar.Position + 1;
  Amount := Amount + Amount1;
  if Amount > 0 then WS.Cells[49,5+i]:= Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=1 AND Cat = 2');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[22,5+i] := Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #Told2 WHERE YearOld='+IntToStr(God));
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[54,5+i]:= Amount;
  Amount1 := GetIntField('SELECT COUNT(*) FROM #Told2 WHERE YearOld='+IntToStr(God-1));
  ProgBar.Position := ProgBar.Position + 1;
  Amount := Amount + Amount1;
  if Amount > 0 then WS.Cells[55,5+i]:= Amount;
  Amount1 := GetIntField('SELECT COUNT(*) FROM #Told2 WHERE YearOld='+IntToStr(God-2));
  ProgBar.Position := ProgBar.Position + 1;
  Amount := Amount + Amount1;
  if Amount > 0 then WS.Cells[56,5+i]:= Amount;
  Amount1 := GetIntField('SELECT COUNT(*) FROM #Told2 WHERE YearOld ='+IntToStr(God-3));
  ProgBar.Position := ProgBar.Position + 1;
  Amount := Amount + Amount1;
  if Amount > 0 then WS.Cells[57,5+i]:= Amount;
  Amount1 := GetIntField('SELECT COUNT(*) FROM #Told2 WHERE YearOld='+IntToStr(God-4));
  ProgBar.Position := ProgBar.Position + 1;
  Amount := Amount + Amount1;
  if Amount > 0 then WS.Cells[58,5+i]:= Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TAc WHERE FK_Grant_Type_Charge=1 AND Cat = 3');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[23,5+i] := Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #Told3 WHERE YearOld='+IntToStr(God));
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[51,5+i]:= Amount;
  Amount1 := GetIntField('SELECT COUNT(*) FROM #Told3 WHERE YearOld='+IntToStr(God-1));
  ProgBar.Position := ProgBar.Position + 1;
  Amount := Amount + Amount1;
  if Amount > 0 then WS.Cells[52,5+i]:= Amount;

  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE Enter_Institute = '+IntToStr(GodEnter));
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[24,5+i] := Amount;
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE Enter_Institute = '+IntToStr(GodEnter)+' AND Cat = 1');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[25,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE Enter_Institute = '+IntToStr(GodEnter)+' AND Cat = 2');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[26,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE Enter_Institute = '+IntToStr(GodEnter)+' AND Cat = 3');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[27,5+i]:= Amount;
  ProgBar.Position := ProgBar.Position + 1;
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE Enter_Institute <> '+IntToStr(GodEnter));
  if Amount > 0 then WS.Cells[28,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE Enter_Institute <> '+IntToStr(GodEnter)+' AND Cat = 1');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[29,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE Enter_Institute <> '+IntToStr(GodEnter)+' AND Cat = 2');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[30,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE Enter_Institute <> '+IntToStr(GodEnter)+' AND Cat = 3');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[31,5+i]:= Amount;
  
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE FK_Country <> 643');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[32,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE FK_Country <> 643 AND Cat = 1');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[33,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE FK_Country <> 643 AND Cat = 2');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[34,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE FK_Country <> 643 AND Cat = 3');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[35,5+i]:= Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TOc WHERE Oc4 = 0');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[38,5+i]:= Amount;
   Amount := GetIntField('SELECT COUNT(*) FROM #TOc WHERE Oc5 <> 0 AND Oc4 <> 0 AND Oc5 > Oc4 ');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[39,5+i]:= Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TOc WHERE Oc5 <> 0 AND Oc4 <> 0 AND Oc5 = Oc4 ');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[40,5+i]:= Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TOc WHERE Oc5 <> 0 AND Oc4 <> 0 AND Oc5 < Oc4 ');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[41,5+i]:= Amount;
  Amount := GetIntField('SELECT COUNT(*) FROM #TOc WHERE Oc5 = 0');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[42,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(*) FROM #TTest WHERE QMark = Test');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[43,5+i]:= Amount;
  Amount := GetIntField('SELECT Count(*) FROM #TAc WHERE FK_Country <> 643');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[44,5+i]:= Amount;
  ProgBar.Position := ProgBar.Position + 1;

  DropTempTabl('#Told1');
  DropTempTabl('#Told2');
  DropTempTabl('#Told3');
  DropTempTabl('#Toc');
  DropTempTabl('#TTest');

//Студенты, получающие социальную стипендию,стипендию нуждающимся и повышенную гос. стипендию в этом году в указанном месяце
  ProgBar.Position:=0;
  for j := 2 to 20 do begin
  if ((j = 2) or (j = 18)) then
   begin
   s1 := 'SELECT DISTINCT #TSt.PrK_Entrant,#TSt.PrK_Person,PrK_Order_Doc,PrK_Status_Type,Cat,'+
   ' FK_Doc_Kind,Term_Relate_Code,Num_Term,'+
   ' #TSt.FK_Order_Wording,Kurs INTO #TSN FROM #TSt'+
   ' INNER JOIN Grant_Stud ON Grant_Stud.FK_Entrant = #TSt.PrK_Entrant'+
   ' AND Grant_Stud.NFirm = #TSt.NFirm AND Grant_Stud.FK_Grant_Type='+IntToStr(j)+
   ' AND Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God)+''''+
   ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God)+''''+
   ' INNER JOIN Order_Doc ON Grant_Stud.FK_Order_Doc=Order_Doc.PrK_Order_Doc'+
   ' AND((FK_Grant_Type <> 18 AND Order_Doc.NFirm = #TSt.NFirm)'+
   ' OR (FK_Grant_Type = 18 AND Order_Doc.NFirm = 99))'+
   ' AND Order_Doc.Order_Status=1'+
   ' INNER JOIN Person_Doc ON Person_Doc.FK_Person = #TSt.PrK_Person'+
   ' INNER JOIN Doc_Kind ON Person_Doc.FK_Doc_Kind = PrK_Doc_Kind'+
   ' AND ((Doc_Kind.FK_Doc_Type = 4) OR (FK_Doc_Kind = 23) OR (FK_Doc_Kind = 17)'+
   ' OR (FK_Doc_Kind = 40))'+
   ' LEFT OUTER JOIN Term_Result ON Term_Result.FK_Entrant = PrK_Entrant'+
   ' AND (('+IntToStr(i)+' = '+IntToStr(1)+' AND Term_Result.Term_Num = #TSt.Num_Term-1)'+
   ' OR ('+IntToStr(i)+' > '+IntToStr(1)+' AND Term_Result.Term_Num = #TSt.Num_Term))'+
   ' LEFT OUTER JOIN Term_Relate ON Term_Result.FK_Term_Relate = PrK_Term_Relate';
//   if j = 2 then
//    RunSQL(s1+' AND Order_Doc.NFirm = #TSt.NFirm AND Order_Doc.Order_Status=1');
//   if j = 18 then
//    RunSQL(s1+' AND Order_Doc.NFirm = 99 AND Order_Doc.Order_Status=1');
//   ProgBar.Position := ProgBar.Position + 1;

{   s3:= 'SELECT PrK_Entrant,Cat,Kurs INTO #T14 FROM #TSt'+
    ' INNER JOIN Grant_Stud ON Grant_Stud.FK_Entrant = #TSt.PrK_Entrant'+
   ' AND Grant_Stud.NFirm = #TSt.NFirm AND Grant_Stud.FK_Grant_Type='+IntToStr(j)+
   ' AND Pay_Start_Date <= ''01.'+ month +'.'+ IntToStr(God)+''''+
   ' AND Pay_End_Date >= ''01.'+ month +'.'+ IntToStr(God)+''''+
   ' INNER JOIN Order_Doc ON Grant_Stud.FK_Order_Doc=Order_Doc.PrK_Order_Doc'+
   ' AND Order_Doc.NFirm = #TSt.NFirm AND Order_Doc.Order_Status=1';

   if j = 14 then RunSQL(s3);}

  ProgBar.Position := ProgBar.Position + 1;
  if j = 2 then
   begin
   RunSQL(s1+' AND Order_Doc.NFirm = #TSt.NFirm AND Order_Doc.Order_Status=1');
   Amount := GetIntField('SELECT Count(PrK_Entrant) FROM #TSN');
   ProgBar.Position := ProgBar.Position + 1;
   if Amount = 0 then goto 99
   else
   begin
    WS.Cells[59,5+i]:= Amount;
    Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=10'); //сироты и сироты на гос.об
    ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then
       begin
        WS.Cells[60,5+i]:= Amount;
        Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=10 AND Cat = 1');
        ProgBar.Position := ProgBar.Position + 1;
        if Amount > 0 then WS.Cells[61,5+i]:= Amount;
        Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=10 AND Cat = 2');
        ProgBar.Position := ProgBar.Position + 1;
        if Amount > 0 then WS.Cells[62,5+i]:= Amount;
        Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=10 AND Cat = 3');
        ProgBar.Position := ProgBar.Position + 1;
        if Amount > 0 then WS.Cells[63,5+i]:= Amount;
       end;

     Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind IN (12,13,14,37)');//инвалиды
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then
      begin
       WS.Cells[64,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind IN (12,13,14,37) AND Cat = 1');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[65,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind IN (12,13,14,37) AND Cat = 2');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[66,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind IN (12,13,14,37) AND Cat = 3');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[67,5+i]:= Amount;
      end;

     Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=16');//зараженные территории
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then
      begin
       WS.Cells[68,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=16 AND Cat = 1');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[69,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=16 AND Cat = 2');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[70,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=16 AND Cat = 3');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[71,5+i]:= Amount;
      end;

     Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=15' );//инвалиды ВС
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then
      begin
       WS.Cells[72,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=15 AND Cat = 1');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[73,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=15 AND Cat = 2');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[74,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=15 AND Cat = 3');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[75,5+i]:= Amount;
      end;

      Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE ((FK_Doc_Kind=17) OR (FK_Doc_Kind=29))');//имеют право на соц.помощь
      ProgBar.Position := ProgBar.Position + 1;
      if  Amount > 0 then
       begin
        WS.Cells[76,5+i]:= Amount;
        Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE ((FK_Doc_Kind=17) OR (FK_Doc_Kind=29)) AND Cat = 1');
        ProgBar.Position := ProgBar.Position + 1;
        if Amount > 0 then WS.Cells[77,5+i]:= Amount;
        Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE ((FK_Doc_Kind=17) OR (FK_Doc_Kind=29)) AND Cat = 2');
        ProgBar.Position := ProgBar.Position + 1;
        if Amount > 0 then WS.Cells[78,5+i]:= Amount;
        Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE ((FK_Doc_Kind=17) OR (FK_Doc_Kind=29)) AND Cat = 3');
        ProgBar.Position := ProgBar.Position + 1;
        if Amount > 0 then WS.Cells[79,5+i]:= Amount;
      end;

     Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=29');//получивших соц.помощь
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then
      begin
       WS.Cells[80,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=29 AND Cat = 1');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[81,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=29 AND Cat = 2');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[82,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=29 AND Cat = 3');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[83,5+i]:= Amount;
      end;

     Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=36');//контрактники ВС
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then
      begin
       WS.Cells[84,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=36 AND Cat = 1');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[85,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=36 AND Cat = 2');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[86,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=36 AND Cat = 3');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[87,5+i]:= Amount;
      end;

     Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=11');//удостоверение участника военных действий
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then
      begin
       WS.Cells[88,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=11 AND Cat = 1');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[89,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=11 AND Cat = 2');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[90,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE FK_Doc_Kind=11 AND Cat = 3');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[91,5+i]:= Amount;
      end;

     Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE ((FK_Doc_Kind=40) OR (FK_Doc_Kind=23))');//другие категории
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then
      begin
       WS.Cells[92,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE ((FK_Doc_Kind=40) OR (FK_Doc_Kind=23)) AND Cat = 1');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[93,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE ((FK_Doc_Kind=40) OR (FK_Doc_Kind=23)) AND Cat = 2');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[94,5+i]:= Amount;
       Amount := GetIntField('SELECT COUNT(FK_Doc_Kind) FROM #TSN WHERE ((FK_Doc_Kind=40) OR (FK_Doc_Kind=23)) AND Cat = 3');
       ProgBar.Position := ProgBar.Position + 1;
       if Amount > 0 then WS.Cells[95,5+i]:= Amount;
      end;

     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE PrK_Entrant IN(SELECT PrK_Entrant FROM #TAc)');//есть ак.стипендия
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then WS.Cells[96,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE PrK_Entrant IN(SELECT PrK_Entrant FROM #TAc) AND Cat = 1');
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then WS.Cells[97,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE PrK_Entrant IN(SELECT PrK_Entrant FROM #TAc) AND Cat = 2');
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then WS.Cells[98,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE PrK_Entrant IN(SELECT PrK_Entrant FROM #TAc) AND Cat = 3');
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then WS.Cells[99,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE (FLOOR(Term_Relate_Code/10)=4 OR FLOOR(Term_Relate_Code/10)=5)'+
      ' AND PrK_Entrant NOT IN(SELECT PrK_Entrant FROM #TAc)');//нет ак.стипендии и нет задолженности
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then WS.Cells[100,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE (Term_Relate_Code=21 OR Term_Relate_Code=61 OR FLOOR(Term_Relate_Code/10)=7)'+
      ' AND PrK_Entrant NOT IN(SELECT PrK_Entrant FROM #TAc)');//нет ак.стипендии и есть задолженность
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then WS.Cells[101,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE PrK_Status_Type = 6');//в ак. отпуске
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then WS.Cells[102,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE PrK_Status_Type = 6 AND FK_Order_Wording = 17');//в ак. отпуске по уходу за ребенком
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then WS.Cells[103,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE PrK_Status_Type = 6 AND FK_Order_Wording = 16');//в ак. отпуске по мед.
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then WS.Cells[104,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE PrK_Status_Type = 6 AND FK_Order_Wording > 17');//в ак. отпуске по дргим причинам
     ProgBar.Position := ProgBar.Position + 1;
     if  Amount > 0 then WS.Cells[105,5+i]:= Amount;
     end;
    end;
 //  end;
  if j = 18 then
   begin
    RunSQL(s1+' AND Order_Doc.NFirm = 99 AND Order_Doc.Order_Status=1');
    ProgBar.Position := ProgBar.Position + 1;
    Amount := GetIntField('SELECT COUNT(*) FROM #TSN');
    ProgBar.Position := ProgBar.Position + 1;
   if Amount = 0 then goto 99
   else
    begin
     WS.Cells[107,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 1 AND Kurs = 1');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[108,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 1 AND Kurs = 2');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[109,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 1 AND Kurs = 3');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[110,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 1 AND Kurs = 4');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[111,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 2 AND Kurs = 1');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[112,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 2 AND Kurs = 2');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[113,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 2 AND Kurs = 3');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[114,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 2 AND Kurs = 4');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[115,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 2 AND Kurs = 5');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[116,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 2 AND Kurs = 6');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[117,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 3 AND Kurs = 1');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[118,5+i]:= Amount;
     Amount := GetIntField('SELECT COUNT(*) FROM #TSN WHERE Cat = 3 AND Kurs = 2');
     ProgBar.Position := ProgBar.Position + 1;
    if Amount > 0 then WS.Cells[119,5+i]:= Amount;
   end;
  end;
 end;
99: begin
     if ((j = 2) or (j = 18)) then begin DropTempTabl('#TSN'); end;
//     else if j = 14 then begin DropTempTabl('#T14'); end;
    end;
end;
  s3 := 'SELECT FK_Entrant,Size_Help,Cat INTO #TM FROM #TSt'+
  ' INNER JOIN Entrant_GrantHelp ON Entrant_GrantHelp.FK_Entrant = #TSt.PrK_Entrant'+
  ' WHERE HelpYear =' +IntToStr(God)+' AND HelpMonth =' +IntToStr(i);
  ProgBar.Position := ProgBar.Position + 1;
  RunSQL(s3);
  ProgBar.Position := ProgBar.Position + 1;
  CountSt := GetIntField('SELECT COUNT(*) FROM #TM');
  if CountSt = 0 then goto 98;
  WS.Cells[120,5+i]:= GetIntField('SELECT MAX(Size_Help) FROM #TM');
  WS.Cells[121,5+i]:= GetIntField('SELECT MIN(Size_Help) FROM #TM');
  SumHelp := GetIntField('SELECT SUM(Size_Help) FROM #TM');
  WS.Cells[122,5+i]:= FloatToStrF(SumHelp/CountSt,FFFixed,8,2);
  WS.Cells[123,5+i]:= CountSt;
   Amount := GetIntField('SELECT COUNT(*) FROM #TM WHERE Cat = 1');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[124,5+i]:= Amount;
   Amount := GetIntField('SELECT COUNT(*) FROM #TM WHERE Cat = 2');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[125,5+i]:= Amount;
   Amount := GetIntField('SELECT COUNT(*) FROM #TM WHERE Cat = 3');
  ProgBar.Position := ProgBar.Position + 1;
  if Amount > 0 then WS.Cells[126,5+i]:= Amount;
98: DropTempTabl('#TSt');
  DropTempTabl('#TM');
  DropTempTabl('#TAc');
 end;
 ProgBar.Visible:=False;
 LabeledEdit1.Text := ' ';
 LabeledEdit1.Refresh;
end;
 finally
 XL.CutCopyMode:=False;
 Form1.HideWBPages(WB,'StatGrant');
 XL.DisplayFullScreen:=True;
 XL.DisplayFullScreen:=False;
 XL.Visible:=True;
 end;
 end;

procedure TFormStat_Grant.FormClose(Sender: TObject;
  var Action: TCloseAction);
begin
 try
 if not VarIsEmpty(XL) then begin
   XL.Quit;
 end;
 finally
 XL:=Unassigned;
 end;
end;

procedure TFormStat_Grant.Button2Enter(Sender: TObject);
begin
 if RadioGroup1.ItemIndex = 0 then
  LabeledEdit1.Visible := true
 else LabeledEdit1.Visible := false;
end;

procedure TFormStat_Grant.Button1Click(Sender: TObject);
begin
 Close;
end;

end.

