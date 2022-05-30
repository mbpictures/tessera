# Admin Dashboard
Tessera comes with a highly configurable admin dashboard, which is available at the
```/admin``` sub path of your ticket shop.


## Accessing the admin dashboard
When you visit ```/admin``` for the first time, you will be redirected to the login page.
If you have no registered user yet, you can register the first admin user by clicking the
```Register now``` button. After registering the default user, which will be granted with all permissions automatically,
you can now log in.

## Profile settings
To access your profile settings, click the Avatar-Button in the top right corner in the admin dashboard. Here You can change the E-Mail Address and Username of your account. You can change the password of your account also, by providing the currently used password.
Here you can also create [API keys](/api.md#Creating-an-api-key) which are used to authenticate you against the [admin API](https://mbpictures.github.io/tessera/api/).
To never miss placed orders or paid invoices, you can create notifications in the ```Notifications```-Section. Click the Add Button and select the type of notification you want to add (currently web request and email available).
E-Mail Notifications email the occurred event to the email address associated to your account. Web Request Notifications generate a POST HTTP request to the specified URL with all available information (e.g. event type, parameters, body, ...).
Below the notification type, you can select which types of events should trigger this notification.

## Managing events
Select ```Event Management > Events``` in the sidebar. Here you can edit already existing events by clicking the 🖊️ button.
![Edit Event Dialog](images/admin/edit-event.png)
This opens a dialog where you can edit the event name and the seat type. You can choose between Seat map and free.
When choosing free you can select, which [categories](#categories) you want for this event.
While using seat map, you can select which seat map should be used for the event and directly preview the selected seat map.
To add a new event click the ```add event``` button. This will open a dialog where you can enter the event name and choose the
seat type. Additional configuration can be done afterwards in the edit dialog.

### Categories
You can manage your categories by selecting ```Event Management > Categories``` in the sidebar.
On this page you can add new categories (by clicking the ```add category``` button) or edit the existing ones (by clicking the 🖊️ button).
Categories define how much a ticket for this category cost, which currency should be used and which colors should be used in the seat map.
You either assign categories directly (when using ```free``` as seat type) or in the definition of the seat map.

> [!WARNING]
> Never edit category prices or currency for running events, as this has an influence on already booked but not yet paid orders.

> [!TIP]
> To update prices on running categories, create a new category with the new price and assign this category to your running event and remove the old category.

### Seat Maps
To edit and add new seat maps, please select ```Event Maangement > Seat Maps``` in the sidebar.
Here you can view, which seat map is used in which event. Also, you can edit or add seat maps.
In the seat map editor, you can delete a seat by clicking on it. To add a new seat in row, click the ➕ button at the end of each row.

![Add new seat in seat map](images/admin/edit-seatmap-add.png)

You see the new seat marked as black. You can change to position of the seat by clicking left or right and change the amount (e.g. for couple seats).
To finally add the seat, choose a category or ```Spacing``` (which is usefully for gangways).
To add a new row, click the ```add row``` button at the bottom of the seat map. Click the ```Save Seat Map``` when you are happy with your changes.
To increase editing speed you can export the current seat map to ```json``` format and upload it back to by clicking the import/export buttons.
You have also an overview on the colors used in the seat map when opening the ```Categories``` accordion.

## User Management
Of course, you can have multiple users, which can access individually configurable areas. To do so, open the ```User``` page on the left of the sidebar.
Here you can add new users by entering Username (unique), e-mail (unique) and password. After that, you can assign rights.

## Options
Open the ```Options``` page in the sidebar. Here you can edit information like title and subtitle of your ticket shop (general section),
set active payment or delivery methods and customize the shop theme by uploading a custom theme configuration.

> [!NOTE]
> Payment methods need to be configured using environment variables for security reasons.

## Translations
You can change translations inside the ```Translations``` page. To add more languages (German and English are available by default),
you have to add a new entry in the ```locales.json``` file in the root directory. After that, rebuild the ticket shop using the
commands of the quickstart guide. After that, you can add your translations for the new language in the admin dashboard or
override the existing translations. Press the ```Save``` button at the bottom of the page, when you are happy with your changes.

> [!WARNING]
> After you changes are stored, you have to rebuild the ticket shop again.

## Tickets scanning
To check, if tickets are valid and to mark them as used, you can open the ```Ticket Scan``` page on the device with a camera.
Place the QR-Code of the ticket in the center of the rectangle. By default, tickets are accepted by default. When you
see a green toast with ```Ticket accepted```, the ticket is valid, hasn't been used already and was marked as used now.
When the ticket is used or isn't valid, you'll get an information toast in blue.
To disable the automatic manner of marking tickets as used, open the settings (button in the top right corner) and deactivate
```Auto send tickets``` switch. Here you can also change the camera which should be used.
By default, the back camera of your smartphone will be used.
