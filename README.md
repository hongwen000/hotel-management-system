# Hotel Managerment System


## 备选的参考资料
[一份毕设](https://wenku.baidu.com/view/db4bd002ce84b9d528ea81c758f5f61fb73628cd.html?re=view)
[石墨链接](https://shimo.im/docs/XqEoUej1gsgk2Did)

## 一些考虑的细节
### 用户(角色)分配
需要有客户、前台和经理。
客户有自己的profile信息和积分。客户可以查询房间信息和房间的预订情况，但不能查到其他客户的信息。
前台可以查询房间信息和客户的profile信息。
经理除了可以查到所有的信息外，还可以修改房间信息，例如房间价格等。

还有一个角色是root。它可以修改任何信息，例如在一些少见的特殊情况时，修改订单情况、订单日期等。

### 空房查询
booking关系的列是用户ID、房间、日期、预订状态。

当需要查询空房时，只需要查询booking关系中该日期和该房型是否有状态不为取消的record。如果有，说明房间被占用，如果没有，说明房间未被占用。
