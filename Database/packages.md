# Packages

## NIX Core
- line_en: Shared framework (patterns, extensions, utils) that every other module builds on.
- line_vi: Framework dùng chung (design pattern, extension, utils), nền cho mọi module khác.
- tags: Unity, uGUI, C#
- stars: 0
- version: v1.0.0
- en: Framework built to be used for all of my games, a mandatory dependency for all other modules. Includes many essential features like Design Patterns, Extend, Utils, etc... Born with the purpose of reusability and optimization across multiple projects, helping speed up development and limit bugs when having to build from scratch for each new project.
- vi: Framework được xây dựng để sử dụng cho tất cả các game của tôi, là một depedency bắt buộc của tất cả module khác. Bao gồm nhiều chức năng cần thiết như Design Pattern, Extend, Utils, v.v.... Được sinh ra với mục đích tái sử dụng và tối ưu hoá qua nhiều dự án, giúp tăng tốc độ phát triển và hạn chế bug xảy ra khi phải xây dựng lại từ đầu cho mỗi dự án mới.

## Localization
- line_en: Font size sync and CJK font optimization; translations synced from Google Sheets.
- line_vi: Đồng bộ size giữa các font, tối ưu font CJK; dịch trên Google Sheets và đồng bộ vào Unity.
- tags: Unity, uGUI, C#
- stars: 0
- version: v1.0.0
- en: This package handles issues that arise during Localization work, such as: synchronizing size consistency across fonts, and optimizing heavy CJK (Chinese/Japanese/Korean) fonts. The package uses automated APIs within Unity's pipeline to automate the processing and synchronization. Translation is done on Google Sheets and synced from Unity.
- vi: Package này xử lý các vấn đề khi làm Localization như: xử lý đồng bộ size giữa các font, tối ưu font JCK nặng. Package sử dụng các API tự động trong pipeline của Unity để việc xử lý và đồng bộ được tự động hóa. Dịch trên googlesheet và đồng bộ từ Unity.

## UI Framework
- line_en: Popups, screens, transitions and UI animations, configurable per game.
- line_vi: Quản lý Popup, Screen, Transition và animation UI, dễ config theo từng game.
- tags: Unity, uGUI, C#
- youtubeId: Yd7vDterctQ
- stars: 0
- version: v1.0.0
- en: Package for building UI Canvas system in Unity. Helps create and manage Popups, Screens, Transitions, and animations for UI elements. The package is designed to be easily configurable or create different animations to keep the UI feeling consistent with the overall game.
- vi: Package này dùng để xây dựng hệ thống UI Canvas trong Unity. Giúp tạo và quản lý các Popup, Screen, Transition và animation cho các UI element. Package được thiết kế để dễ config hoặc tạo ra các animation khác nhau giúp feeling của UI đồng nhất với tổng thể game.

## Monetization Kit
- line_en: Ads & IAP SDK integration; switch SDKs with a scripting define.
- line_vi: Tích hợp SDK Ads & IAP; đổi SDK chỉ bằng Define.
- tags: Unity, SDK, C#
- stars: 0
- version: v1.0.0
- en: Package that helps integrate Ads SDK, Purchase SDK into Unity more easily. Allows switching between multiple SDKs just by changing Define in Player Settings.
- vi: Package giúp việc tích hợp Ads SDK, Purchase SDK vào Unity dễ dàng hơn. Cho phép thay đổi giữa nhiều SDK chỉ với việc thay đổi Define trong Player Settings.

## Tracking Service
- line_en: One tracking API for Firebase, AppsFlyer and Adjust, with common casual-game events built in.
- line_vi: Một API tracking cho Firebase, AppsFlyer, Adjust, có sẵn các event phổ biến cho game casual.
- tags: Unity, SDK, C#
- stars: 0
- version: v1.0.0
- en: Package that provides API for tracking for Firebase, Appsflyer, Adjust, etc... Comes with built-in popular event tracking for casual, puzzle games.
- vi: Package này cung cấp API để tracking cho Firebase, Appsflyer, Adjust, v.v.... Tích hợp sẵn các event tracking phổ biến cho game casual, puzzle.

## Audio Service
- line_en: Data-driven audio events per AudioClip, without changing how clips are played.
- line_vi: Quản lý audio theo event và data cho từng AudioClip, không đổi cách play.
- tags: Unity, C#, Audio
- stars: 0
- version: v1.0.0
- en: Audio management system that allows you to create events for Audio, manage events for each AudioClip separately, and many other features. The special point is that it is designed in the form of Flutter API and managed through data so the way to play AudioClip is not changed.
- vi: Hệ thống quản lý Audio cho phép bạn tạo event cho Audio, quản lý event cho từng AudioClip riêng và nhiều tính năng khác. Điểm đặc biệt là được thiết kế theo dạng Flutter API và quản lí thông qua data nên cách play AudioClip không bị thay đổi.

## Storage Service
- line_en: Save/Load with PlayerData in ScriptableObjects — debug and edit data in the Inspector.
- line_vi: Save/Load quản lý PlayerData bằng ScriptableObject, debug và sửa data ngay trên Inspector.
- tags: Unity, Save/Load, C#
- stars: 0
- version: v1.0.0
- en: A Save/Load system that manages PlayerData through ScriptableObject, making it easy to debug and test data directly on the Inspector.
- vi: Một hệ thống Save/Load quản lý PlayerData thông qua ScriptableObject, giúp debug dễ dàng và test data trực tiếp trên Inspector.

## Skeleton Extend
- line_en: Preview multiple Spine skins and animations in the editor, plus helper APIs.
- line_vi: Preview nhiều skin và animation Spine trong editor, kèm API tiện ích.
- tags: Unity, SpineUnity, C#
- github: https://github.com/tien0702
- stars: 0
- version: v1.0.0
- en: One inconvenience when working with Spine Skeleton is that it doesn't preview multiple skins and multiple animations with skins. This package helps solve that problem and you simply need to Add Component to the GameObject with SkeletonDataAsset and select the animations, skins you want to preview and you're done. In addition, the package also provides you with many convenient APIs to work with Spine Unity.
- vi: Một điểm bất tiện khi làm việc với Spine Skeleton là không preview được nhiều skins và preview nhiều animation cùng skins. Package này giúp giải quyết vấn đề đó và bạn đơn giản chỉ cần Add Component vào GameObject có SkeletonDataAsset và chọn animations, skins muốn preview là xong. Ngoài ra package còn cung cấp cho bạn nhiều API tiện lợi để làm việc với Spine Unity.
