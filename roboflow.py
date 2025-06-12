!pip install roboflow

from roboflow import Roboflow
rf = Roboflow(api_key="aBPcgn7xI7UGZm1uHn82")
project = rf.workspace("price-tag-wlnnt").project("pricetag-vnluk")
version = project.version(1)
dataset = version.download("yolov11")

# curl -L "https://app.roboflow.com/ds/tBtNw9FaEf?key=QsfcDNcTZA" > roboflow.zip; unzip roboflow.zip; rm roboflow.zip