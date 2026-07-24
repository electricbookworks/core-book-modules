package com.electricbookworks.youtubereferer;

import android.net.Uri;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.engine.SystemWebView;
import org.apache.cordova.engine.SystemWebViewClient;
import org.apache.cordova.engine.SystemWebViewEngine;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class YouTubeReferer extends CordovaPlugin {

    @Override
    public void pluginInitialize() {
        SystemWebViewEngine engine = (SystemWebViewEngine) webView.getEngine();
        SystemWebView systemWebView = (SystemWebView) engine.getView();

        systemWebView.setWebViewClient(new SystemWebViewClient(engine) {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                String path = uri.getPath();

                // Only intercept YouTube embed page requests
                boolean isYouTubeEmbed = host != null && path != null
                        && (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com"))
                        && path.startsWith("/embed/");

                if (isYouTubeEmbed) {
                    try {
                        URL url = new URL(uri.toString());
                        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                        conn.setRequestMethod(request.getMethod());

                        // Copy original request headers
                        for (Map.Entry<String, String> entry : request.getRequestHeaders().entrySet()) {
                            if (!entry.getKey().equalsIgnoreCase("Referer")) {
                                conn.setRequestProperty(entry.getKey(), entry.getValue());
                            }
                        }

                        // Set Referer to google.com to avoid bot detection
                        // (mirrors the Electron fix in _app/index.js)
                        conn.setRequestProperty("Referer", "https://www.google.com/");

                        // Sync cookies from the WebView cookie store
                        String cookies = CookieManager.getInstance().getCookie(uri.toString());
                        if (cookies != null && !cookies.isEmpty()) {
                            conn.setRequestProperty("Cookie", cookies);
                        }

                        conn.setInstanceFollowRedirects(true);
                        conn.setUseCaches(true);
                        conn.connect();

                        // Store response cookies back to WebView
                        Map<String, List<String>> headerFields = conn.getHeaderFields();
                        List<String> setCookieHeaders = headerFields.get("Set-Cookie");
                        if (setCookieHeaders != null) {
                            for (String cookie : setCookieHeaders) {
                                CookieManager.getInstance().setCookie(uri.toString(), cookie);
                            }
                        }

                        int statusCode = conn.getResponseCode();
                        String responseMessage = conn.getResponseMessage();
                        String contentType = conn.getContentType();
                        String mimeType = "text/html";
                        String encoding = "utf-8";

                        if (contentType != null) {
                            String[] parts = contentType.split(";");
                            mimeType = parts[0].trim();
                            for (String part : parts) {
                                String trimmed = part.trim();
                                if (trimmed.startsWith("charset=")) {
                                    encoding = trimmed.substring(8);
                                }
                            }
                        }

                        InputStream inputStream;
                        if (statusCode >= 400) {
                            inputStream = conn.getErrorStream();
                        } else {
                            inputStream = conn.getInputStream();
                        }

                        // Build response headers
                        Map<String, String> responseHeaders = new HashMap<>();
                        for (Map.Entry<String, List<String>> entry : headerFields.entrySet()) {
                            if (entry.getKey() != null && !entry.getKey().isEmpty()) {
                                responseHeaders.put(entry.getKey(), entry.getValue().get(0));
                            }
                        }

                        return new WebResourceResponse(mimeType, encoding, statusCode,
                                responseMessage != null ? responseMessage : "OK",
                                responseHeaders, inputStream);
                    } catch (Exception e) {
                        // Fall back to default handling on error
                        return super.shouldInterceptRequest(view, request);
                    }
                }

                return super.shouldInterceptRequest(view, request);
            }
        });
    }
}
