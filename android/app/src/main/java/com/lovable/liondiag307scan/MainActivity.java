
package com.lovable.liondiag307scan;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    try {
      // Register BluetoothSerial plugin safely
      Class<?> bluetoothSerialClass = Class.forName("com.megster.cordova.BluetoothSerial");
      registerPlugin(bluetoothSerialClass);
    } catch (ClassNotFoundException e) {
      android.util.Log.w("MainActivity", "BluetoothSerial plugin not found: " + e.getMessage());
    } catch (Exception e) {
      android.util.Log.e("MainActivity", "Error registering BluetoothSerial plugin: " + e.getMessage());
    }
  }
}
