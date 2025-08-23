package com.lovable.liondiag307scan;

import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d("DEBUG", "MainActivity started");
        Toast.makeText(this, "App started", Toast.LENGTH_SHORT).show();
    }
}
