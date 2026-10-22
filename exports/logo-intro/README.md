# Logo Intro (NIX)

| File | Nội dung |
|---|---|
| `logo-intro.html` | Trang chỉnh intro — mở bằng Chrome |
| `logo-intro.json` | Bộ tham số đã set |
| `render.mjs` | Xuất video chất lượng cao từ file tham số |

## Chỉnh intro
1. Mở `logo-intro.html` bằng Chrome.
2. Bấm **📂 Mở .json** → chọn `logo-intro.json` để nạp bộ tham số.
3. Chỉnh xong bấm **💾 Lưu .json** để lưu lại (ghi đè file cũ).

Trang cũng tự nhớ tham số trong trình duyệt, nhưng file `.json` mới là bản lưu chắc chắn.

## Xuất video
Cần Google Chrome và ffmpeg. Cài một lần:
```
npm i
```
Xuất (đuôi file quyết định định dạng):
```
node render.mjs logo-intro.html out.mp4  logo-intro.json      # H.264, đăng mạng xã hội
node render.mjs logo-intro.html out.mov  logo-intro.json      # ProRes 4444 (master, có alpha nếu bật "Nền trong suốt")
node render.mjs logo-intro.html out.webm logo-intro.json      # VP9 có alpha, dùng cho web
node render.mjs logo-intro.html frames/  logo-intro.json      # chuỗi ảnh PNG
```
Đổi tỉ lệ khung mà không cần sửa file: thay `logo-intro.json` bằng JSON viết thẳng, ví dụ `'{"aspect":"9:16"}'` (các tham số khác lấy mặc định).
Chỉ render đoạn giữa Trim đầu và Trim cuối. Thêm `--font=Acumin.otf` nếu dùng chữ gõ bằng font chưa cài trên máy.

## Âm thanh
5 mẫu âm thanh trong `sounds/` (WAV 48 kHz / 24-bit, dài bằng intro + 1 s đuôi reverb), bản nghe thử kèm hình trong `sounds/preview/`.
Âm thanh được tổng hợp theo đúng mốc thời gian trong `logo-intro.json` — đổi nhịp intro xong thì tạo lại:
```
node sound.mjs logo-intro.json sounds
```
