import os
import json

dir_path = os.path.dirname(os.path.realpath(__file__))
print(dir_path)

Images = {}

for dir in os.scandir(dir_path):
    if dir.is_dir():
        print(dir.name)
        for file in os.scandir(dir.path):
            # print(dir.path + file.name)
            name = os.path.splitext(file.name)[0]
            key = "["+dir.name+"] "+name
            tile = {"file":"images/"+dir.name+"/"+file.name}
            if dir.name == "Characters":
                tile["label"] = name
                tile["prerender"] = 1
                
            elif dir.name == "walls":
                tile["size"] = "wall"
                verticalTile = tile.copy()
                verticalKey = key + " (vertical)"
                verticalTile["rotate"] = 90
                Images[verticalKey] = verticalTile

            elif dir.name == "shapes": 
                largeTile = tile.copy()
                largeKey = key + " (large)"
                largeTile["size"] = "large"
                Images[largeKey] = largeTile
                hugeTile = tile.copy()
                hugeKey = key + " (huge)"
                hugeTile["size"] = "huge"
                Images[hugeKey] = hugeTile

            else:
                largeTile = tile.copy()
                largeKey = key + " (large)"
                largeTile["size"] = "large"
                Images[largeKey] = largeTile

            Images[key] = tile

imageJson = json.dumps(Images, indent=4, sort_keys=True)
text_file = open("images.js", "w")
n = text_file.write("var Images = "+imageJson)
text_file.close()