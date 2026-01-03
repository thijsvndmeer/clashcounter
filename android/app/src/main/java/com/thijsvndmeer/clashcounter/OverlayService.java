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
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class OverlayService extends Service {
    private static final String TAG = "OverlayService";
    private WindowManager windowManager;
    private FrameLayout touchLayout;
    private WebView webView;
    private WindowManager.LayoutParams params;

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
                (int) (400 * metrics.density), // FIXED HEIGHT for debugging
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

        // DEBUG: Set background to see the window frame
        touchLayout.setBackgroundColor(Color.argb(100, 255, 0, 0)); // Semi-transparent RED

        // Initialize WebView
        webView = new WebView(this);
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
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);

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
        String url = "file:///android_asset/public/index.html?mode=overlay";
        if (intent != null && intent.getStringExtra("url") != null) {
            url = intent.getStringExtra("url");
        }
        Log.d(TAG, "onStartCommand loading url: " + url);
        webView.loadUrl(url);
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (touchLayout != null) {
            windowManager.removeView(touchLayout);
        }
    }
}
