import random
import pandas as pd
from faker import Faker

fake = Faker('zh_CN')
column_names=['id','credential', 'name','gender', 'phone', 'birthday', 'balance', 'bonus']

datas = []

for i in range(100):
    this_data = {}
    this_data['id'] = i
    this_data['credential'] = ''.join( [ str(random.randrange(0,10)) for i in range(18)] )
    this_data['name'] = fake.name()
    this_data['gender'] = random.choice([0,1])
    this_data['phone'] = '13'+''.join( [ str(random.randrange(0,10)) for i in range(9)] )
    this_data['birthday'] = '201{}-{}-{}'.format(random.randint(0,9), random.randint(1,12), random.randint(1,30))
    this_data['balance'] = random.randint(1,10000)
    this_data['bonus'] = random.randint(1,10000)
    datas.append(this_data)

df = pd.DataFrame(datas, columns=column_names)

# print(df)
df.to_csv('user_test_data.csv', index=None)