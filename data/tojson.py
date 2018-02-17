import csv
import json

data = []

with open('open_pubs.csv', 'r') as csvfile:
    reader = csv.reader(csvfile, csvfile)

    for row in reader:
        d = {
            'name': row[1],
            'address': row[2],
            'postcode': row[3],
            'latitude': row[6],
            'longitude': row[7],
        }

        data.append(d)

with open('open_pubs.json', 'w+') as f:
    f.write(json.dumps(data, indent=4))

