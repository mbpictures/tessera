<h1 align="center">
  <img alt="Logo" src="http://projects.marius-butz.de/ticketshop/TicketshopLogo.png" width="100%" />
  Welcome to Tessera 👋<br />
  Your open source ticket shop
  <p>
    <a href="LICENSE" target="_blank">
      <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" />
    </a>
    <img alt="Build Status" src="https://github.com/mbpictures/ticketshop/actions/workflows/build.yml/badge.svg" />
    <img alt="CI Status" src="https://github.com/mbpictures/ticketshop/actions/workflows/node.js.yml/badge.svg" />
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/mbpictures/tessera?style=for-the-badge&token=R7CJUK2K1X">
  </p>
</h1>

> Open source and ready to use ticket shop with lots of customization abilities and feature rich admin dashboard. Several payment providers (stripe, paypal, sofort) are available out of the box and new ones can be added with ease.

### 🏠 [Homepage](https://github.com/mbpictures/ticketshop#readme)

### ✨ [Demo](https://nextjs-ticketshop-demo.herokuapp.com/)

## ⚡️ Quickstart
### 📥 Install

```sh
npm install
```

### ▶️ Run
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

## 🎯 Features
- Select events, seats and collect customer information (address, e-mail, etc)
- Three delivery possibilities: Download (Template Ticket with QR), Postal delivery and box office
- Payment: [PayPal](https://www.paypal.com/), [stripe](https://stripe.com) (iban & credit card), [sofort](https://www.klarna.com/sofort/) and invoice
- Sending emails (with templates) containing invoice and/or tickets
- Easy to use admin section with event management, seat map editor, viewing orders, marking invoices as payed
- RESTful API to manage events and orders with third party tools or webhooks
- Customizable ticket shop UI with import function for [MUI themes](https://mui.com/customization/theming/)
- Multi-Language Support and translation editor

### 🔜 Planned
- Ticket control webapp (to scan and verify downloaded tickets)
- Notifications (e.g. for new orders) and configurable webhooks
- Event scheduling

If you miss some features, which are not planned, please create an [issue ❗](https://github.com/mbpictures/tessera/issues)

## 👨‍💻 Tech stack
- This project uses [React](https://reactjs.org/) for frontend
- [MUI](https://mui.com/) as UI library
- [Next.JS](https://nextjs.org/) is used as WebSDK and as server backend
- All data is stored in a database (e.g. Postgre) and with [prisma](https://www.prisma.io/) as ORM accessed
- Integration testing is done with [cypress](https://www.cypress.io/)
- Continuous Integration using [GitHub Actions](https://github.com/features/actions)

## 📝 Documentation
A detailed documentation will follow soon!

## 👥 Author

👤 **Marius Butz**

* Website: http://marius-butz.de

## ⭐️ Show your support

- Give a [⭐️ star](https://github.com/mbpictures/tessera) if this project helped you!
- Create a [🍴 fork](https://github.com/mbpictures/tessera) and contribute by fixing bugs or adding features
