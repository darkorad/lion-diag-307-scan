package com.lovable.liondiag307scan;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.megster.cordova.BluetoothSerial;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerPlugin(BluetoothSerial.class);
  }
}
