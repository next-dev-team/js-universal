# Check if pinokiod directory exists
if [ -d "pinokiod" ]; then
    # If exists, just pull the latest changes
    cd pinokiod
    git checkout tabui
    git pull
    git submodule update --init --recursive
    cd ..
else
    # If not exists, add as submodule
    git submodule add -b tabui https://github.com/pinokiocomputer/pinokiod.git
    git submodule update --init --recursive
fi
