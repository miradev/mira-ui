#!/bin/bash

WIDGET_NAME=$1
WIDGET_ZIP=$1
WIDGET_ZIP+=".zip"

echo $WIDGET_ZIP

cd workspace
zip -r $WIDGET_ZIP .

cp $WIDGET_ZIP /Users/$USER/Library/Application\ Support/Electron/widgets

yarn build