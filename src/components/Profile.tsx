import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../api/userService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from './ui/use-toast';
import { Loader2, Upload } from 'lucide-react';

const Profile: React.FC = () => {
    const { user, loading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setUpdatingProfile(true);
        try {
            const updatedUser = await userService.updateUser(user._id, {
                name,
                phone
            });

            // Update the localStorage data too (would be better with a context refresh function)
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                userData.name = name;
                userData.phone = phone;
                localStorage.setItem('user', JSON.stringify(userData));
            }

            toast({
                title: "Profile updated",
                description: "Your profile information has been updated successfully."
            });
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast({
                title: "Update failed",
                description: error.response?.data?.message || "Failed to update profile. Please try again.",
                variant: "destructive"
            });
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadingImage(true);
        try {
            await userService.updateProfilePicture(user._id, file);

            toast({
                title: "Profile picture updated",
                description: "Your profile picture has been updated successfully."
            });

            // Refresh page to show new image
            window.location.reload();
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast({
                title: "Upload failed",
                description: error.response?.data?.message || "Failed to upload image. Please try again.",
                variant: "destructive"
            });
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

            <div className="grid gap-6 md:grid-cols-[250px_1fr]">
                {/* Profile Image Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>Update your profile picture</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32">
                            {user.profilePicture ? (
                                <AvatarImage src={user.profilePicture} alt={user.name} />
                            ) : null}
                            <AvatarFallback className="text-2xl">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="relative w-full">
                            <Input
                                type="file"
                                id="profile-picture"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            />
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={uploadingImage}
                            >
                                {uploadingImage ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload New Picture
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>

                    <CardFooter className="flex-col items-start gap-2">
                        <CardDescription>
                            SustainPoints: <span className="font-semibold">{user.sustainPoints}</span>
                        </CardDescription>
                        <CardDescription>
                            Member since: <span className="font-semibold">{new Date(user.joinDate).toLocaleDateString()}</span>
                        </CardDescription>
                    </CardFooter>
                </Card>

                {/* Profile Info Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    value={email}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email address cannot be changed. Contact support if necessary.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Your phone number"
                                />
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter>
                        <Button
                            type="submit"
                            form="profile-form"
                            disabled={updatingProfile}
                        >
                            {updatingProfile ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Profile;