const int P1_PIN = A0;
const int P2_PIN = A1;

/// TO DO: Add button pins

int P1_value = 0;
int P2_value = 0;

void setup() {
  Serial.begin(9600);
}

void loop() {
//  Serial.println("hello!");
//  delay(100);

  P1_value = analogRead(P1_PIN);
  P2_value = analogRead(P2_PIN);

  Serial.print("P1_value: ");
  Serial.println(P1_value);
}
