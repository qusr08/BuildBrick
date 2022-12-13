const int P1_PIN = A0;
const int P2_PIN = A1;
const int B1_PIN = 2;
const int B2_PIN = 3;

int P1_value = 0;
int P2_value = 0;
int B1_value = 0;
int B2_value = 0;

void setup() {
  pinMode(B1_PIN, INPUT);
  pinMode(B2_PIN, INPUT);
  
  Serial.begin(9600);
}

void loop() {
  P1_value = analogRead(P1_PIN);
  P2_value = analogRead(P2_PIN);
  B1_value = digitalRead(B1_PIN);
  B2_value = digitalRead(B2_PIN);

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
