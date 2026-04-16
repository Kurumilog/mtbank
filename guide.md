# 1. Java
sudo pacman -S jdk17-openjdk

# 2. Command Line Tools (актуальная ссылка)
mkdir -p ~/android-sdk/cmdline-tools
cd ~/android-sdk/cmdline-tools
wget https://dl.google.com/android/repository/commandlinetools-linux-14742923_latest.zip
unzip commandlinetools-linux-14742923_latest.zip
mv cmdline-tools latest    # важная структура папок для sdkmanager

# 3. Переменные окружения (~/.zshrc)
echo 'export ANDROID_HOME=$HOME/android-sdk' >> ~/.zshrc
echo 'export ANDROID_SDK_ROOT=$ANDROID_HOME' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/build-tools/28.0.3' >> ~/.zshrc
source ~/.zshrc

# 4. Установить SDK компоненты
sdkmanager "platform-tools"
sdkmanager "platforms;android-36"
sdkmanager "build-tools;28.0.3"
sdkmanager --licenses

# 5. Flutter — через git clone (надежнее wget)
cd ~/
git clone https://github.com/flutter/flutter.git -b stable
echo 'export PATH=$PATH:$HOME/flutter/bin' >> ~/.zshrc
source ~/.zshrc

# 6. Привязать Flutter к SDK
flutter config --android-sdk $ANDROID_HOME
flutter doctor --android-licenses
flutter doctor