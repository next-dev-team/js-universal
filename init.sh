# Add pinokiod submodule
git submodule add -b tabui https://github.com/pinokiocomputer/pinokiod.git
git submodule update --init --recursive

cd pinokiod && npm i && cd ..
