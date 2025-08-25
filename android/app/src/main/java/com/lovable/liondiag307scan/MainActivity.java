
package com.lovable.liondiag307scan;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register our custom Bluetooth plugin
        registerPlugin(CustomBluetoothSerial.class);
    }
}
