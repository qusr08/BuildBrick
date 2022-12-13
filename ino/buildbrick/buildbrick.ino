const int P1_PIN = A0;
const int P2_PIN = A1;
const int B1_PIN = A2;
const int B2_PIN = A3;

int P1_value = 0;
int P2_value = 0;
int B1_value = 0;
int B2_value = 0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  P1_value = analogRead(P1_PIN);
  P2_value = analogRead(P2_PIN);
  B1_value = analogRead(B1_PIN) / 1023;
  B2_value = analogRead(B2_PIN) / 1023;

  print_value(P1_value, 4);
  print_value(P2_value, 4);
  print_value(B1_value, 0);
  print_value(B2_value, 0);
  Serial.println();

  delay(50);
}

void print_value(int value, int leading_zeros) {
  int n = value;
  while (leading_zeros != 0) {
    if (n != 0) {
      n = n / 10;
    } else {
      Serial.print("0");
    }
    
    leading_zeros--;
  }
  
  Serial.print(value);
}
