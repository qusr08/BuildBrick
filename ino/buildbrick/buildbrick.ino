const int P1_PIN = A0;
const int P2_PIN = A1;
const int B1_PIN = 3;
const int B2_PIN = 2;
const int BUZZ_PIN = 13;

int P1_value = 0;
int P2_value = 0;
int B1_value = 0;
int B2_value = 0;

bool B1_ison = false;
bool B2_ison = false;

void setup() {
  pinMode(BUZZ_PIN, OUTPUT);
  pinMode(B1_PIN, INPUT);
  pinMode(B2_PIN, INPUT);
  
  Serial.begin(9600);
}

void loop() {
  P1_value = set_value(analogRead(P1_PIN) / 1023.0 * 24, P1_value, 0);
//  P1_value = set_value(analogRead(P1_PIN), P1_value, 0);
//  P2_value = set_value(analogRead(P2_PIN), P2_value, 0);
  B1_value = digitalRead(B1_PIN);
  B2_value = digitalRead(B2_PIN);
//  P1_value = analogRead(P1_PIN);
//  P2_value = analogRead(P2_PIN);
//  B1_value = analogRead(B1_PIN) / 1023;
//  B2_value = analogRead(B2_PIN) / 1023;

  if (B1_ison) {
    if (B1_value == 0) {
      B1_ison = false;
    }
    B1_value = 0;
  } else {
    if (B1_value == 1) {
      B1_ison = true;
      tone(BUZZ_PIN, 523, 250);
    }
  }
  
  if (B2_ison) {
    if (B2_value == 0) {
      B2_ison = false;
    }
    B2_value = 0;
  } else {
    if (B2_value == 1) {
      B2_ison = true;
      tone(BUZZ_PIN, 659, 250);
    }
  }

  print_value(P1_value, 4);
  print_value(P2_value, 4);
  print_value(B1_value, 0);
  print_value(B2_value, 0);
  Serial.println();

  delay(50);
}

int set_value(int new_value, int old_value, int diff_amount) {
  if (abs(new_value - old_value) <= diff_amount) {
    return old_value;
  }
  
  tone(BUZZ_PIN, 440 + (new_value * 10) , 50);

  return new_value;
}

void print_value(int value, int leading_zeros) {
  int n = value;

  if (n == 0) {
    leading_zeros--;
  }
  
  while (leading_zeros > 0) {
    if (n != 0) {
      n = n / 10;
    } else {
      Serial.print("0");
    }
    
    leading_zeros--;
  }
  
  Serial.print(value);
}
