<h1 align="center">
  <img src="http://projects.marius-butz.de/ticketshop/TicketshopLogo.png" width="100%" />
  Welcome to Tessera 👋<br />
  Your open source ticket shop
  <p>
    <a href="LICENSE" target="_blank">
      <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" />
    </a>
    <img alt="CI Status" src="https://github.com/mbpictures/ticketshop/actions/workflows/node.js.yml/badge.svg" />
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/mbpictures/tessera?style=for-the-badge&token=R7CJUK2K1X">
  </p>
</h1>

> Open source and ready to use ticket shop with lots of customization abilities and feature rich admin dashboard. Several payment providers (stripe, paypal, sofort) are available out of the box and new ones can be added with ease.

### 🏠 [Homepage](https://github.com/mbpictures/ticketshop#readme)

### ✨ [Demo](https://nextjs-ticketshop-demo.herokuapp.com/)

## Quickstart
### Install

```sh
npm install
```

### Run
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

## Documentation
A detailed documentation will follow soon!

## Author

👤 **Marius Butz**

* Website: http://marius-butz.de

## Show your support

Give a ⭐️ if this project helped you!
