import random
import pandas as pd
from faker import Faker

fake = Faker('zh_CN')
column_names=['id','time', 'status','room_id', 'user_id']
op_column_names = ['id', 'time', 'operation', 'order_id']
datas = []
op_datas = []

op_counter = 1

for i in range(10):
    room_ids = [k+100 for k in range(100)]
    random.shuffle(room_ids)
    room_ids = room_ids[:10]
    user_ids = [k+1 for k in range(100)]
    random.shuffle(user_ids)
    user_ids = user_ids[:10]
    for j in range(10):
        this_data = {}
        op_data = {}
        this_data['id'] = i*10+j+1
        this_data['time'] = '2019-01-1'+str(i)
        this_data['status'] = int(random.random() > 0.1)
        this_data['room_id'] = room_ids[j]
        this_data['user_id'] = user_ids[j]
        op_data['id'] = op_counter
        op_counter += 1
        op_data['time'] = this_data['time']
        op_data['operation'] = 1
        op_data['order_id'] = this_data['id']
        op_datas.append(op_data)
        if (this_data['status'] == 0):
            op_data = {}
            op_data['id'] = op_counter
            op_counter += 1
            op_data['time'] = this_data['time']
            op_data['operation'] = 2
            op_data['order_id'] = this_data['id']    
            op_datas.append(op_data)
        
        datas.append(this_data)

df = pd.DataFrame(datas, columns=column_names)
op_df = pd.DataFrame(op_datas, columns=op_column_names)

# print(df)
df.to_csv('order_test_data.csv', index=None)
op_df.to_csv('op_test_data.csv', index=None)