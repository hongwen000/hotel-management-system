import random
import pandas as pd
from faker import Faker

fake = Faker('zh_CN')
column_names=['id','check_in','check_out','status','room_id', 'user_id']
op_column_names = ['id', 'time', 'operation', 'order_id']
datas = []
op_datas = []

id_counter = 1
op_counter = 1

room_ids = [k+100 for k in range(100)]
user_ids = [k+1 for k in range(100)]

order_df = pd.DataFrame(columns=column_names)
op_df = pd.DataFrame(columns=op_column_names)

# 1. 生成数据
for i in range(600):
    # 生成一条订单
    this_data = {}
    this_data['id'] = id_counter
    id_counter += 1
    check_in_day = random.randint(1,25)
    check_out_day = check_in_day + random.randint(0,5)
    this_data['check_in'] = '2019-01-{:0>2d}'.format(check_in_day)
    this_data['check_out'] = '2019-01-{:0>2d}'.format(check_out_day)
    this_data['status'] = int(random.random() > 0.1)
    this_data['room_id'] = random.choice(room_ids)
    this_data['user_id'] = random.choice(user_ids)

    this_op_data = {}
    this_op_data['id'] = op_counter
    op_counter += 1
    this_op_data['time'] = '2019-01-{:0>2d}'.format(check_in_day)
    this_op_data['operation'] = 1
    this_op_data['order_id'] = this_data['id']

    this_op_data_2 = {}
    this_op_data_2['id'] = op_counter
    op_counter += 1
    this_op_data_2['time'] = '2019-01-{:0>2d}'.format(check_in_day)
    this_op_data_2['operation'] = 2
    this_op_data_2['order_id'] = this_data['id']

# 2. 如果符合条件那就插入
    isOK = True
    test_df = order_df[(order_df['room_id'] == this_data['room_id'] )&(order_df['status'] == 1)]
    # 如果test_df中含有与该订单相冲突的订单，那就不ok
    for idx, row in test_df.iterrows():
        ci_day = int(row['check_in'][-2:])
        co_day = int(row['check_out'][-2:])
        if (ci_day <= check_in_day and check_in_day <= co_day) or (ci_day <= check_out_day and check_out_day <= co_day):
            isOK = False
            break
    if (isOK):
        # print(this_data)
        this_df = pd.DataFrame([this_data], columns=column_names)
        order_df = pd.concat([order_df, this_df])
        if (this_data['status'] == 1):
            df1 = pd.DataFrame([this_op_data], columns=op_column_names)
        else:
            df1 = pd.DataFrame([this_op_data, this_op_data_2], columns=op_column_names)
        op_df = pd.concat([op_df, df1])


# print(order_df)

print(order_df[order_df['room_id'] == 196])

order_df.to_csv('order_test_data.csv', index=None)
op_df.to_csv('op_test_data.csv', index=None)

# random.shuffle(room_ids)
# random.shuffle(user_ids)
# room_ids = room_ids[:100]
# user_ids = user_ids[:100]
# for i in range(100):
#     for j in range(10):
#         this_data = {}
#         op_data = {}
#         this_data['id'] = i*10+j+1
#         this_data['check_in'] = '2019-01-{:0>2d}'.format(str(10+j))
#         this_data['check_out'] = '2019-01-{:0>2d}'.format(str(10+j))
#         this_data['status'] = int(random.random() > 0.1)
#         this_data['room_id'] = room_ids[j]
#         this_data['user_id'] = user_ids[j]
#         op_data['id'] = op_counter
#         op_counter += 1
#         op_data['time'] = this_data['time']
#         op_data['operation'] = 1
#         op_data['order_id'] = this_data['id']
#         op_datas.append(op_data)
#         if (this_data['status'] == 0):
#             op_data = {}
#             op_data['id'] = op_counter
#             op_counter += 1
#             op_data['time'] = this_data['time']
#             op_data['operation'] = 2
#             op_data['order_id'] = this_data['id']    
#             op_datas.append(op_data)
        
#         datas.append(this_data)

# df = pd.DataFrame(datas, columns=column_names)
# op_df = pd.DataFrame(op_datas, columns=op_column_names)

# # print(df)
# df.to_csv('order_test_data.csv', index=None)
# op_df.to_csv('op_test_data.csv', index=None)