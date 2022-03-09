# Quickstart
## 📥 Install
```sh
git clone https://github.com/mbpictures/tessera.git
cd tessera
npm install
```



## ▶️ Run
1. Create a ```.env``` file containing all values of [.env.example](.env.example) except the optional ones
2. Set up a database (further instructions [here](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/connect-your-database-typescript-postgres))
3. If you're **not** using _postgresql_ please update the provider flag inside the [schema.prisma](prisma/schema.prisma)
4. Optional: Configure payment providers in ```.env``` (e.g. stripe, sofort, paypal)
5. Optional: Configure email service to send invoices and digital digits (e.g. gmail)
6. Push prisma db schema to your database and generate prisma client with:
   ```shell
   prisma db push
   prisma generate
   ```
7. (OPTIONAL) seed the database with demo configuration:
   ```shell
    prisma db seed
    ```
8. Start the server at port 3000 using:
    ```shell
    npm run build
    npm run start:default
    ```
9. Open the ticketshop at the url in the console
10. Open the admin page at URL/admin
11. Create your first admin user with the register button (the first user is granted with admin permissions)

> [!NOTE]
> Your local server is usually available under [http://127.0.0.1:3000](http://127.0.0.1:3000) and the admin page under [http://127.0.0.1:3000/admin](http://127.0.0.1:3000/admin)

## 🌐 Hosting
As local servers are only available within your private network, you need to host your ticket shop
somewhere in the internet. I recommend [heroku](https://heroku.com) or [vercel](https://vercel.com) for this purpose.
Simply follow the hosting guidelines and configure the environment variables.

> [!WARNING]
> Vercel has no builtin database provider, so you need to setup an external database. Heroku has builtin postgres support.
