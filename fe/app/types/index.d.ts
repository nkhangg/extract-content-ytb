interface ITimestamp {
  created_at: string;
  updated_at: string;
}

// Sample data interface
interface IUser extends ITimestamp {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at: string | null;
  is_active: number;
  company_id: number;
  position: string | null;
  phonenumber: string | null;
  avatar: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  company: ICompany | null;
  permissions: [];
}

interface ITranscriptData {
  audio_file: string;
  folder: string;
  title: string;
  transcript_file: string;
}

interface ICompany extends ITimestamp {
  id: number;
  name: string;
  address: string;
  city: string;
  zip: string;
  state_id: number;
  country_id: number;
  region_id: number;
  phonenumber: string;
  faxnumber: an | null;
  website: string;
  is_active: number;
  user_id: number;
  order_membership_id: number | null;
  state: IState;
  country: ICountry;
  region: IRegion;
  staffs: IUser[];
  logo: string | null;
  user?: IUser;
}

interface ICompanyOrder extends ICompany {
  order: number;
}

interface ICondition extends ITimestamp {
  id: number;
  name: string;
  key: string;
}

interface IInventory extends ITimestamp {
  id: number;
  part: string;
  company_id: number;
  heci_clei: string;
  mfg: string;
  price: string;
  quantity: number;
  status_id: number;
  description: string;
  condition_id: number;
  special: string;
  age: number;
  company: Company;
  condition: Condition;
}

interface IRegion extends ITimestamp {
  id: number;
  name: string;
  is_active: 0 | 1;
}

interface ICountry extends ITimestamp {
  id: number;
  name: string;
  code: string;
  is_active: 0 | 1;
}

interface IState extends ITimestamp {
  id: number;
  name: string;
  is_active: 1 | 0;
  country_id: ICountry["id"];
}

interface ICart extends ITimestamp {
  id: number;
  company: ICompany;
  items: IInventory[];
  has_more: boolean;
  total_items: number;
}

interface IResponse<R> {
  message: string;
  status_code: HttpStatusCode;
  data: R;
  timestamp: string;
}

interface IResponsePagination<T> extends IResponse<T> {
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
  current_page: number;
}
