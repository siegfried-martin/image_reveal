import os
import json

dir_path = os.path.dirname(os.path.realpath(__file__))
print(dir_path)

Icons = {}

for dir in os.scandir(dir_path):
    if dir.is_dir():
        print(dir.name)
        for file in os.scandir(dir.path):
            # print(dir.path + file.name)
            name = os.path.splitext(file.name)[0]
            key = "["+dir.name+"] "+name
            tile = {"file":"icons/"+dir.name+"/"+file.name}
            tile["category"] = dir.name
            if dir.name == "Characters":
                tile["label"] = name
                tile["prerender"] = 1
                
            elif dir.name == "walls":
                tile["size"] = "wall"
                verticalTile = tile.copy()
                verticalKey = key + " (vertical)"
                verticalTile["rotate"] = 90
                verticalTile["category"] = dir.name
                Icons[verticalKey] = verticalTile

            elif dir.name == "shapes" or dir.name == "nature": 
                largeTile = tile.copy()
                largeKey = key + " (large)"
                largeTile["size"] = "large"
                largeTile["category"] = dir.name
                Icons[largeKey] = largeTile
                hugeTile = tile.copy()
                hugeKey = key + " (huge)"
                hugeTile["size"] = "huge"
                hugeTile["category"] = dir.name
                Icons[hugeKey] = hugeTile

            else:
                largeTile = tile.copy()
                largeKey = key + " (large)"
                largeTile["size"] = "large"
                largeTile["category"] = dir.name
                Icons[largeKey] = largeTile

            Icons[key] = tile

imageJson = json.dumps(Icons, indent=4, sort_keys=True)
text_file = open("icons.js", "w")
n = text_file.write("var Icons = "+imageJson)
text_file.close()