# PomoTimer

React Native ve Expo ile geliştirilmiş bir Pomodoro zamanlayıcı uygulaması.

## 🚀 Başlangıç

### Gereksinimler

Bu projeyi çalıştırmadan önce aşağıdakilerin yüklü olması gerekir:

- **Node.js** (v18 veya üzeri): [İndir](https://nodejs.org/)
- **npm** veya **yarn**: Node.js ile birlikte gelir
- **Expo Go** (Mobil cihazınızda): 
  - [iOS için App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android için Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Kurulum

1. **Node.js'i yükleyin** (henüz yüklü değilse):
   - https://nodejs.org/ adresinden indirin
   - LTS (Long Term Support) versiyonunu seçin

2. Proje dizininde bağımlılıkları yükleyin:
```bash
npm install
```

**Not**: Proje `react-native-svg` ve `@expo/vector-icons` kütüphanelerini kullanır. Bu bağımlılıklar `npm install` komutuyla otomatik olarak yüklenecektir.

### Çalıştırma

1. Geliştirme sunucusunu başlatın:
```bash
npm start
```

2. Telefonunuzda Expo Go uygulamasını açın

3. QR kodu tarayın:
   - **iOS**: Kamera uygulamasıyla QR kodu tarayın
   - **Android**: Expo Go uygulaması içinden QR kodu tarayın

## 📁 Proje Yapısı

```
PomoTimer/
├── components/          # Yeniden kullanılabilir bileşenler
│   └── Timer.js        # Zamanlayıcı bileşeni
├── screens/            # Uygulama ekranları
│   └── HomeScreen.js   # Ana ekran
├── assets/             # Görsel varlıklar (iconlar, resimler)
├── App.js              # Ana uygulama dosyası
├── app.json            # Expo yapılandırması
├── babel.config.js     # Babel yapılandırması
└── package.json        # Proje bağımlılıkları
```

## 🛠️ Kullanılan Teknolojiler

- **React Native**: Mobil uygulama geliştirme
- **Expo**: Geliştirme ve dağıtım platformu
- **React**: UI kütüphanesi

## 📱 Özellikler

- Pomodoro tekniği için 25 dakikalık zamanlayıcı
- Başlat/Duraklat/Sıfırla kontrolü
- Modern ve temiz kullanıcı arayüzü

## 🔜 Gelecek Özellikler

- Zamanlayıcı geri sayımı
- Bildirimler
- Özelleştirilebilir süre ayarları
- İstatistikler ve geçmiş
- Sesli uyarılar

## 📝 Lisans

MIT

---

**Not**: Projeyi ilk kez çalıştırdığınızda, bağımlılıkların indirilmesi birkaç dakika sürebilir.

