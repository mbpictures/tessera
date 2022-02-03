<h1 align="center">Welcome to ticketshop 👋</h1>
<p align="center">
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <img alt="CI Status" src="https://github.com/mbpictures/ticketshop/actions/workflows/node.js.yml/badge.svg" />
</p>

> Full-stack ticket shop with admin dashboard.

### 🏠 [Homepage](https://github.com/mbpictures/ticketshop#readme)

### ✨ [Demo](https://nextjs-ticketshop-demo.vercel.app)

## Quickstart
### Install

```sh
npm install
```

### Usage
1. Create a ```.env``` file containing all values of [.env.example](.env.example) except the optional ones
2. Set up a database (further instructions [here](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/connect-your-database-typescript-postgres))
3. If you're **not** using _postgresql_ please update the provider flag inside the [schema.prisma](prisma/schema.prisma)
4. Configure payment providers in ```.env``` (e.g. stripe, sofort, paypal)
5. Configure email service to send invoices and digital digits (e.g. gmail)
6. Generate prisma client and db schema using:
   ```shell
   prisma db push
   prisma generate
   ```
7. (OPTIONAL) seed the database with demo configuration:
   ```shell
    prisma db seed
    ```
8. Start the server using:
    ```shell
    npm run build
    npm run start
    ```
9. Open the ticketshop at the url in the console
10. Open the admin page at URL/admin
11. Create your first admin user with the register button

## Author

👤 **Marius Butz**

* Website: http://marius-butz.de

## Show your support

Give a ⭐️ if this project helped you!
