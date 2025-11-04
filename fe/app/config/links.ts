import { PERMISSION } from "../utils/constants";
import { Blocks, ListOrdered, Lock } from "lucide-react";

export interface IMenu {
  title: string;
  url: string;
  icon?: any;
  isActive?: boolean;
  items?: IMenu[];
}

export class Links {
  public static HOME = "/";

  // AUTH
  public static LOGIN = "/login";
  public static FORGOT_PASSWORD = "/forgot-password";
  public static RESET_PASSWORD = "/reset-password";

  public static MANAGE_USER = "/manage-user";
  public static PROFILE = "/profile";
  public static MY_VENDOR = "/my-vendor";
  public static MY_CONTACT = "/my-contact";

  public static RFQ_RECEIVED = "/rfq/received";
  public static RFQ_SENT = "/rfq/sent";
  public static RFQ_NEW = "/rfq/new";

  public static COMPANY_INFO = "/company-info";

  public static INVENTORY = "/inventory";
  public static INVENTORY_ADD = "/inventory/add";
  public static INVENTORY_UPLOAD = "/inventory/upload";
  public static INVENTORY_EXPORT = "/inventory/export";

  // CART
  public static MY_CART = "/my-cart";

  // SEARCH
  public static SEARCH = "/search";
  public static SEARCH_COMPANY = `${this.SEARCH}/company`;
  public static SEARCH_INVENTORY = `${this.SEARCH}/inventory`;
  public static SEARCH_PERSON = `${this.SEARCH}/person`;

  // SETTING
  public static SETTING = "/setting";
  public static SETTING_BLOCKS = `${this.SETTING}/blocks`;
  public static SETTING_PRIORITY = `${this.SETTING}/priority`;

  public static MENUS = [
    {
      id: "main",
      label: "Main",
      items: [
        { label: "Home", href: this.HOME },
        { label: "Help", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Ethics", href: "#" },
        { label: "Site Map", href: "#" },
        { label: "Badges", href: "#" },
      ],
    },
    {
      id: "search",
      label: "Search",
      href: "#",
      items: [
        { label: "Inventory", href: this.SEARCH_INVENTORY },
        { label: "Company", href: this.SEARCH_COMPANY },
        { label: "Person", href: this.SEARCH_PERSON },
      ],
    },
    {
      id: "manage",
      label: "Manage",
      href: "#",
      items: [
        {
          label: "Inventory",
          href: this.INVENTORY,
          permissions: PERMISSION.MANAGE_INVENTORY,
        },
        {
          label: "My RFQs",
          href: this.RFQ_RECEIVED,
          permissions: PERMISSION.MANAGE_RFQ,
        },
        {
          label: "Manage User",
          href: this.MANAGE_USER,
          permissions: PERMISSION.MANAGE_USER,
        },
        { label: "My Profile", href: this.PROFILE },
        { label: "My Vendor", href: this.MY_VENDOR },
        { label: "My Contact", href: this.MY_CONTACT },
        {
          label: "My Company",
          href: this.COMPANY_INFO,
          permissions: PERMISSION.MANAGE_COMPANY,
        },
      ],
    },
    {
      id: "reports",
      label: "Reports",
      href: "#",
      items: [
        { label: "Company", href: "#" },
        { label: "Site Wide", href: "#" },
        { label: "Email", href: "#" },
        { label: "Service Directory Stats", href: "#" },
      ],
    },
  ];

  public static SETTING_MENU = [
    {
      title: "Blocks",
      url: this.SETTING_BLOCKS,
      icon: Lock,
    },
    {
      title: "Priority",
      url: this.SETTING_PRIORITY,
      icon: ListOrdered,
    },
  ];
}
