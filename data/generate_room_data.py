import random
import pandas as pd
from faker import Faker

fake = Faker('zh_CN')
column_names=['id','floor', 'room_num','price', 'type_id']

datas = []

for i in range(100):
    this_data = {}
    this_data['id'] = i+100
    this_data['floor'] = int(i / 10 +1)
    # print(str(i % 10))
    # print(str(this_data['floor'])+str(i % 10))
    this_data['room_num'] = '{:0>d}{:0>2d}'.format(this_data['floor'],i % 10)
    this_data['price'] = this_data['floor'] * 100
    this_data['type_id'] = this_data['floor']
    datas.append(this_data)

df = pd.DataFrame(datas, columns=column_names)

# print(df)
df.to_csv('room_test_data.csv', index=None)