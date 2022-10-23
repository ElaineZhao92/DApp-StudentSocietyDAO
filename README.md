# DApp-StudentSocietyDAO
LAB for ZJU-blockchain-course-2022. A website for student society to make proposals and vote.

##### Task

> 去中心化学生社团组织治理应用 
>
> - 每个学生初始可以拥有或领取一些通证积分（ERC20）。 
> - 每个学生可以在应用中可以： 
>   1. 使用一定数量通证积分，发起关于该社团进行活动或制定规则的提案（Proposal）。 
>   2. 提案发起后一定支出时间内，使用一定数量通证积分可以对提案进行投票（赞成或反对，限制投票次数），投票行为被记录到区块链上。 
>   3. 提案投票时间截止后，赞成数大于反对数的提案通过，提案发起者作为贡献者可以领取一定的积分奖励。 
>
> - (Bonus）发起提案并通过3次的学生，可以领取社团颁发的纪念品（ERC721）

##### Deployment

1. 在本地启动ganache应用，用ganache生成测试链地址的私钥替换config文件里的私钥。

2. 在 `./contracts` 中安装需要的依赖，运行如下的命令：

   ```bash
   npm install
   ```

3. 在 `./contracts` 中编译合约，运行如下的命令：

   ```bash
   npx hardhat compile
   ```

4. 小狐狸中导入ganache本地测试链形成的账户地址

```bash
# run test script
npx hardhat test
# run deploy script
npx hardhat run scripts/deploy.ts

# deploy on ganache
# you should start a ganache application before you run this command
npx hardhat run scripts/deploy.ts --network ganache
```

5. 在 `./frontend` 中启动前端程序，运行如下的命令：

```bash
npm run start
```

## 
