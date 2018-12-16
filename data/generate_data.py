import random
import pandas as pd

column_names=['credential', 'name','gender', 'phone', 'birthday', 'balance', 'bonus','id']
user_names = ['John', 'Mike', 'Amy', 'sfsfd']

datas = []

for i in range(100):
    this_data = {}
    this_data['id'] = i
    this_data[column_names[0]] = ''.join( [ str(random.randrange(0,10)) for i in range(18)] )
    this_data[column_names[1]] = random.choice(user_names)
    this_data[column_names[2]] = random.choice([0,1])
    this_data[column_names[3]] = '13'+''.join( [ str(random.randrange(0,10)) for i in range(9)] )
    this_data[column_names[4]] = '201{}-{}-{}'.format(random.randint(0,9), random.randint(1,12), random.randint(1,30))
    this_data[column_names[5]] = random.randint(1,10000)
    this_data[column_names[6]] = random.randint(1,10000)
    datas.append(this_data)

df = pd.DataFrame(datas, columns=column_names)

print(df)
df.to_csv('user_test_data.csv', index=None)