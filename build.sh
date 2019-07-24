#!/bin/bash

cd workspace

for FILE in *; do
    if [ -d "$FILE" ]; then
        echo "$FILE"

		WIDGET_NAME=$FILE
		WIDGET_ZIP=$FILE
		WIDGET_ZIP+=".zip"

		cd $FILE
        zip -r $WIDGET_ZIP .
        cp $WIDGET_ZIP /Users/$USER/Library/Application\ Support/Electron/widgets
		rm $WIDGET_ZIP        
        cd ..
    fi
done

cd /Users/$USER/Documents/mira-ui/workspace
yarn build

