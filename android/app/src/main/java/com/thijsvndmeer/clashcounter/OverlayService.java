package com.thijsvndmeer.clashcounter;

import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.ContextThemeWrapper;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.ServiceInfo;
import android.content.BroadcastReceiver;
import android.content.IntentFilter;
import androidx.core.app.NotificationCompat;

public class OverlayService extends Service {
    private static final String TAG = "OverlayService";
    private WindowManager windowManager;
    private FrameLayout touchLayout;
    private WebView webView;
    private WindowManager.LayoutParams params;
    private BroadcastReceiver resizeReceiver;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "OverlayService onCreate");
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        // Layout Params
        int layoutFlag;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutFlag = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutFlag = WindowManager.LayoutParams.TYPE_PHONE;
        }

        // Calculate Window Size (90% width, 56dp header)
        android.util.DisplayMetrics metrics = getResources().getDisplayMetrics();
        int screenWidth = metrics.widthPixels;
        final int headerHeightPx = (int) (56 * metrics.density);

        params = new WindowManager.LayoutParams(
                (int) (screenWidth * 0.9),
                ViewGroup.LayoutParams.WRAP_CONTENT, // Dynamic height
                layoutFlag,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT);

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = (int) (screenWidth * 0.05);
        params.y = 100;

        // Container Layout to handle touches
        touchLayout = new FrameLayout(this) {
            private int initialX;
            private int initialY;
            private float initialTouchX;
            private float initialTouchY;
            private boolean isDragging = false;

            @Override
            public boolean dispatchTouchEvent(MotionEvent event) {
                // Drag Logic
                switch (event.getAction() & MotionEvent.ACTION_MASK) {
                    case MotionEvent.ACTION_DOWN:
                        // Drag only if single finger on header
                        if (event.getY() <= headerHeightPx && event.getPointerCount() == 1) {
                            isDragging = true;
                            initialX = params.x;
                            initialY = params.y;
                            initialTouchX = event.getRawX();
                            initialTouchY = event.getRawY();
                        }
                        break;

                    case MotionEvent.ACTION_POINTER_DOWN:
                        isDragging = false; // Cancel drag on pinch
                        break;

                    case MotionEvent.ACTION_MOVE:
                        if (isDragging) {
                            // Safety: stop if multi-touch
                            if (event.getPointerCount() > 1) {
                                isDragging = false;
                            } else {
                                params.x = initialX + (int) (event.getRawX() - initialTouchX);
                                params.y = initialY + (int) (event.getRawY() - initialTouchY);
                                windowManager.updateViewLayout(touchLayout, params);
                            }
                        }
                        break;

                    case MotionEvent.ACTION_UP:
                    case MotionEvent.ACTION_CANCEL:
                        isDragging = false;
                        break;
                }

                // Always propagate to children (WebView)
                super.dispatchTouchEvent(event);

                // Return true to ensure we receive the rest of the stream
                // (Though since we called super, the child likely returned true anyway)
                return true;
            }
        };
        // Ensure the window has at least some height so it doesn't collapse to 0 while
        // loading
        touchLayout.setMinimumHeight((int) (150 * metrics.density));

        // Initialize WebView
        webView = new WebView(new ContextThemeWrapper(this, R.style.AppTheme));
        setupWebView();

        // Add WebView to Container
        // IMPORTANT: Use WRAP_CONTENT for height so the WebView pushes the FrameLayout
        // open
        // (MATCH_PARENT inside WRAP_CONTENT FrameLayout can collapse to 0)
        touchLayout.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));

        // Add Container to Window
        windowManager.addView(touchLayout, params);
        Log.d(TAG, "OverlayService view added to window manager");

        // Register Resize Receiver
        resizeReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if ("com.thijsvndmeer.clashcounter.OVERLAY_RESIZE".equals(intent.getAction())) {
                    int width = intent.getIntExtra("width", params.width);
                    int height = intent.getIntExtra("height", params.height);

                    // Clamp to Screen Size (Safety)
                    android.util.DisplayMetrics dm = getResources().getDisplayMetrics();
                    if (width > dm.widthPixels)
                        width = dm.widthPixels;
                    if (height > dm.heightPixels)
                        height = dm.heightPixels;

                    params.width = width;
                    params.height = height;

                    if (touchLayout != null) {
                        windowManager.updateViewLayout(touchLayout, params);
                    }
                }
            }
        };
        if (Build.VERSION.SDK_INT >= 34) {
            registerReceiver(resizeReceiver, new IntentFilter("com.thijsvndmeer.clashcounter.OVERLAY_RESIZE"),
                    Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(resizeReceiver, new IntentFilter("com.thijsvndmeer.clashcounter.OVERLAY_RESIZE"));
        }
    }

    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("OverlayWebView", consoleMessage.message() + " -- From line "
                        + consoleMessage.lineNumber() + " of "
                        + consoleMessage.sourceId());
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.d(TAG, "Page loaded: " + url);
                // Inject hash change after page load to ensure Router picks it up
                view.evaluateJavascript(
                        "window.location.hash = '#overlay'; window.dispatchEvent(new HashChangeEvent('hashchange'));",
                        null);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "WebView Error: " + description + " URL: " + failingUrl);
            }
        });

        // Set background to transparent for the overlay effect
        webView.setBackgroundColor(0x00000000);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();
        Notification notification = createNotification();

        if (Build.VERSION.SDK_INT >= 34) { // Android 14+
            startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(1, notification);
        }

        String url = "file:///android_asset/public/index.html";
        if (intent != null && intent.getStringExtra("url") != null) {
            url = intent.getStringExtra("url");
        }
        Log.d(TAG, "onStartCommand loading url: " + url);

        if (webView != null) {
            webView.loadUrl(url);
        }

        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    "OverlayServiceChannel",
                    "Overlay Service Channel",
                    NotificationManager.IMPORTANCE_DEFAULT);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    private Notification createNotification() {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, "OverlayServiceChannel")
                .setContentTitle("Clash Counter Overlay")
                .setContentText("Overlay is running")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT);

        return builder.build();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (touchLayout != null) {
            windowManager.removeView(touchLayout);
        }
        if (resizeReceiver != null) {
            try {
                unregisterReceiver(resizeReceiver);
            } catch (IllegalArgumentException e) {
                // Already unregistered or not registered
            }
        }
    }
}
