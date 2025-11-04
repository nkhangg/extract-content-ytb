import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authApi } from "@/api/auth-api.service";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-app-dispatch";
import type { RootState } from "@/store";
import { setUser } from "@/store/slices/app.slice";

export function meta() {
	return [{ title: `${import.meta.env.VITE_APP_NAME} | Profile` }];
}

const UserSchema = z
	.object({
		first_name: z
			.string()
			.min(1, "First name is required")
			.max(100, "The first name field must not be greater than 100 characters."),
		last_name: z
			.string()
			.min(1, "Last name is required")
			.max(100, "The last name field must not be greater than 100 characters."),
		position: z.string().max(100, "The position field must not be greater than 100 characters.").optional(),
		phonenumber: z.string().max(20, "The phone number field must not be greater than 20 characters.").optional(),
		email: z
			.string()
			.email("Invalid email address")
			.max(100, "The email field must not be greater than 100 characters."),

		current_password: z.string().optional(),
		password: z.string().max(32, "The email field must not be greater than 32 characters.").optional(),
		password_confirmation: z.string().optional(),

		facebook: z.string().max(100, "The facebook field must not be greater than 100 characters.").optional(),
		twitter: z.string().max(100, "The twitter field must not be greater than 100 characters.").optional(),
		linkedin: z.string().max(100, "The linkedin field must not be greater than 100 characters.").optional(),
	})
	.refine((data) => !data.current_password || data.current_password.length >= 6, {
		path: ["current_password"],
		message: "Password must be at least 6 characters",
	})
	.refine((data) => !data.password || data.password.length >= 6, {
		path: ["password"],
		message: "Password must be at least 6 characters",
	})
	.refine((data) => !data.password || data.password === data.password_confirmation, {
		path: ["password_confirmation"],
		message: "Passwords do not match",
	});

type UserFormValues = z.infer<typeof UserSchema>;

export interface IIndexProps {}

export default function Profile(props: IIndexProps) {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state: RootState) => state.app);

	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	const [loadingSubmit, setLoadingSubmit] = useState(false);
	const [openPassword, setOpenPassword] = useState(false);

	const form = useForm<UserFormValues>({
		resolver: zodResolver(UserSchema),
		defaultValues: {
			first_name: "",
			last_name: "",
			position: "",
			email: "",

			current_password: "",
			password: "",
			password_confirmation: "",

			facebook: "",
			twitter: "",
			linkedin: "",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				first_name: user.first_name ?? "",
				last_name: user.last_name ?? "",
				position: user.position ?? "",
				phonenumber: user.phonenumber ?? "",
				email: user.email ?? "",
				facebook: user.facebook ?? "",
				twitter: user.twitter ?? "",
				linkedin: user.linkedin ?? "",
			});

			setAvatarPreview(import.meta.env.VITE_BASE_URL.replace("/api/member", "") + "/storage/" + user.avatar);
		}
	}, [user]);

	useEffect(() => {
		if (!openPassword) {
			form.resetField("current_password");
			form.resetField("password");
			form.resetField("password_confirmation");
		}
	}, [openPassword, form]);

	const submitHandler = async (data: UserFormValues) => {
		setLoadingSubmit(true);
		try {
			let res = await authApi.updateMe(data);

			if (res?.status_code === 200) {
				// Clear password form
				form.resetField("current_password");
				form.resetField("password");
				form.resetField("password_confirmation");

				getProfile();
				setOpenPassword(false);
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			setLoadingSubmit(false);
		}
	};

	const getProfile = async () => {
		try {
			const res = await authApi.me();

			if (res?.status_code === 200) {
				dispatch(setUser(res.data));
				console.log(res.data);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const handleUpdateAvatar = async () => {
		if (!avatarFile) {
			toast.error("Please select an image before uploading.");
			return;
		}

		setLoadingSubmit(true);
		try {
			const formData = new FormData();
			formData.append("avatar", avatarFile);

			let res = await authApi.updateAvatar(formData);

			if (res?.status_code === 200) {
				setAvatarFile(null);
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			setLoadingSubmit(false);
		}
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];

			// --- MIME types ---
			const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
			if (!allowedTypes.includes(file.type)) {
				toast.error("Only JPG and PNG images are allowed.");
				return;
			}

			// --- Max size 2048 KB (2MB) ---
			if (file.size > 2 * 1024 * 1024) {
				toast.error("The avatar may not be greater than 2MB.");
				return;
			}

			setAvatarFile(file);
			setAvatarPreview(URL.createObjectURL(file));
		}
	};

	return (
		<Card className="mx-auto max-w-4xl shadow-lg rounded-2xl border border-gray-200">
			<CardHeader className="pb-2">
				<CardTitle className="text-2xl font-bold text-gray-800">Profile Settings</CardTitle>
				<p className="text-sm text-gray-500">Manage your personal details, social accounts, and security.</p>
			</CardHeader>

			<CardContent>
				<form onSubmit={form.handleSubmit(submitHandler)} className="space-y-8">
					{/* Personal Info */}
					<section>
						<h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label className="font-medium mb-2">
									First Name<span className="text-red-500">*</span>
								</Label>
								<Input {...form.register("first_name")} placeholder="Enter first name" required />
								{form.formState.errors.first_name && (
									<p className="text-sm text-red-500">{form.formState.errors.first_name.message}</p>
								)}
							</div>
							<div>
								<Label className="font-medium mb-2">
									Last Name<span className="text-red-500">*</span>
								</Label>
								<Input {...form.register("last_name")} placeholder="Enter last name" required />
								{form.formState.errors.last_name && (
									<p className="text-sm text-red-500">{form.formState.errors.last_name.message}</p>
								)}
							</div>
							<div>
								<Label className="font-medium mb-2">Position</Label>
								<Input {...form.register("position")} placeholder="Enter position" />
								{form.formState.errors.position && (
									<p className="text-sm text-red-500">{form.formState.errors.position.message}</p>
								)}
							</div>
							<div>
								<Label className="font-medium mb-2">Phone Number</Label>
								<Input {...form.register("phonenumber")} placeholder="Enter phone number" />
								{form.formState.errors.phonenumber && (
									<p className="text-sm text-red-500">{form.formState.errors.phonenumber.message}</p>
								)}
							</div>
							<div className="md:col-span-2">
								<Label className="font-medium mb-2">
									Email<span className="text-red-500">*</span>
								</Label>
								<Input type="email" {...form.register("email")} placeholder="Enter email" disabled />
							</div>
						</div>
					</section>

					<Separator />

					{/* Avatar Upload */}
					<section className="flex flex-col items-center gap-4">
						<h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Photo</h2>

						<Avatar className="h-28 w-28 border-4 border-white overflow-hidden">
							<AvatarImage
								src={avatarPreview || ""}
								alt="User Avatar"
								className="h-full w-full object-cover"
							/>
							<AvatarFallback className="text-xl font-semibold bg-gray-200">
								<svg
									data-avatar-placeholder-icon="true"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									height="80"
									width="80"
								>
									<path
										d="M0.877014 7.49988C0.877014 3.84219 3.84216 0.877045 7.49985 0.877045C11.1575 0.877045 14.1227 3.84219 14.1227 7.49988C14.1227 11.1575 11.1575 14.1227 7.49985 14.1227C3.84216 14.1227 0.877014 11.1575 0.877014 7.49988ZM7.49985 1.82704C4.36683 1.82704 1.82701 4.36686 1.82701 7.49988C1.82701 8.97196 2.38774 10.3131 3.30727 11.3213C4.19074 9.94119 5.73818 9.02499 7.50023 9.02499C9.26206 9.02499 10.8093 9.94097 11.6929 11.3208C12.6121 10.3127 13.1727 8.97172 13.1727 7.49988C13.1727 4.36686 10.6328 1.82704 7.49985 1.82704ZM10.9818 11.9787C10.2839 10.7795 8.9857 9.97499 7.50023 9.97499C6.01458 9.97499 4.71624 10.7797 4.01845 11.9791C4.97952 12.7272 6.18765 13.1727 7.49985 13.1727C8.81227 13.1727 10.0206 12.727 10.9818 11.9787ZM5.14999 6.50487C5.14999 5.207 6.20212 4.15487 7.49999 4.15487C8.79786 4.15487 9.84999 5.207 9.84999 6.50487C9.84999 7.80274 8.79786 8.85487 7.49999 8.85487C6.20212 8.85487 5.14999 7.80274 5.14999 6.50487ZM7.49999 5.10487C6.72679 5.10487 6.09999 5.73167 6.09999 6.50487C6.09999 7.27807 6.72679 7.90487 7.49999 7.90487C8.27319 7.90487 8.89999 7.27807 8.89999 6.50487C8.89999 5.73167 8.27319 5.10487 7.49999 5.10487Z"
										fill="currentColor"
										fillRule="evenodd"
										clipRule="evenodd"
									></path>
								</svg>
							</AvatarFallback>
						</Avatar>

						<div>
							<input
								type="file"
								id="avatar-upload"
								accept="image/png, image/jpeg"
								className="hidden"
								onChange={handleAvatarChange}
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="flex items-center gap-2"
								onClick={() => document.getElementById("avatar-upload")?.click()}
							>
								<Upload className="h-4 w-4" />
								Change Avatar
							</Button>
						</div>

						<Button
							type="button"
							onClick={handleUpdateAvatar}
							disabled={loadingSubmit || !avatarFile}
							className="mt-2"
						>
							{loadingSubmit ? "Uploading..." : "Save Avatar"}
						</Button>
					</section>

					<Separator />

					{/* Social Links */}
					<section>
						<h2 className="text-lg font-semibold text-gray-700 mb-4">Social Networking</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-3">
							{/* Facebook */}
							<div>
								<div>
									<Label className="font-medium mb-2">Facebook</Label>
									<Input {...form.register("facebook")} placeholder="Profile/URL" />
								</div>

								{form.watch("facebook") && (
									<a
										href={`https://facebook.com/${form.watch("facebook")}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm hover:text-red-600"
									>
										Test
									</a>
								)}
							</div>

							{/* Twitter */}
							<div>
								<div>
									<Label className="font-medium mb-2">Twitter</Label>
									<Input {...form.register("twitter")} placeholder="Profile/URL" />
									{form.watch("twitter") && (
										<a
											href={`https://twitter.com/${form.watch("twitter")}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm hover:text-red-600"
										>
											Test
										</a>
									)}
								</div>
							</div>

							{/* LinkedIn */}
							<div>
								<div>
									<Label className="font-medium mb-2">Linked-In</Label>
									<Input {...form.register("linkedin")} placeholder="Profile/URL" />
								</div>

								{form.watch("linkedin") && (
									<a
										href={`https://linkedin.com/in/${form.watch("linkedin")}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm hover:text-red-600"
									>
										Test
									</a>
								)}
							</div>
						</div>

						<p className="text-xs text-gray-500 mt-1">
							(Use your profile ID, e.g. <code>broker-bin</code> → https://linkedin.com/in/broker-bin)
						</p>
					</section>

					<Separator />

					{/* Password Update  */}
					<section>
						<Collapsible open={openPassword} onOpenChange={setOpenPassword}>
							<CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
								<span className="text-lg font-semibold text-gray-700">Update Your Password</span>
								<ChevronDown className="h-5 w-5 text-gray-500" />
							</CollapsibleTrigger>
							<CollapsibleContent className="mt-4 space-y-4">
								<div>
									<Label className="font-medium mb-2">
										Current Password<span className="text-red-500">*</span>
									</Label>
									<Input
										type="password"
										{...form.register("current_password")}
										placeholder="Enter current password"
										required
									/>
									{form.formState.errors.current_password && (
										<p className="text-sm text-red-500">
											{form.formState.errors.current_password.message}
										</p>
									)}
								</div>
								<div>
									<Label className="font-medium mb-2">
										New Password<span className="text-red-500">*</span>
									</Label>
									<Input
										type="password"
										{...form.register("password")}
										placeholder="Enter new password"
										required
									/>
									{form.formState.errors.password && (
										<p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
									)}
								</div>
								<div>
									<Label className="font-medium mb-2">
										Confirm New Password<span className="text-red-500">*</span>
									</Label>
									<Input
										type="password"
										{...form.register("password_confirmation")}
										placeholder="Confirm new password"
										required
									/>
									{form.formState.errors.password_confirmation && (
										<p className="text-sm text-red-500">
											{form.formState.errors.password_confirmation.message}
										</p>
									)}
								</div>
							</CollapsibleContent>
						</Collapsible>
					</section>

					{/* Submit */}
					<div className="flex justify-end">
						<Button type="submit" disabled={loadingSubmit} className="rounded-lg px-6">
							{loadingSubmit ? "Saving..." : "Update"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
