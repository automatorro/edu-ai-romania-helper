
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, Users, AlertTriangle } from 'lucide-react';
import { useAdminOperations } from '@/hooks/useAdminOperations';
import { useAuth } from '@/contexts/AuthContext';

const AdminPanel = () => {
  const { isAdmin, users, usersLoading, promoteToAdmin, removeAdminRole } = useAdminOperations();
  const { user: currentUser } = useAuth();

  // Security check - only render for authenticated admin users
  if (!currentUser || !isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Nu ai permisiuni de administrator</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (usersLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Se încarcă...</div>
        </CardContent>
      </Card>
    );
  }

  const handlePromoteUser = (userId: string) => {
    if (window.confirm('Ești sigur că vrei să promovezi acest utilizator la administrator?')) {
      promoteToAdmin.mutate(userId);
    }
  };

  const handleRemoveAdmin = (userId: string) => {
    if (userId === currentUser.id) {
      alert('Nu îți poți elimina propriul rol de administrator!');
      return;
    }
    
    if (window.confirm('Ești sigur că vrei să elimini rolul de administrator pentru acest utilizator?')) {
      removeAdminRole.mutate(userId);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Panou Administrator
          </CardTitle>
          <CardDescription>
            Gestionează utilizatorii și permisiunile din sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Administrator activ: {currentUser.name}</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Ai acces complet la toate funcționalitățile sistemului.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Utilizatori ({users?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.user_id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </Badge>
                      <Badge variant="outline">
                        {user.user_type}
                      </Badge>
                      <Badge variant={user.subscription === 'premium' ? 'default' : 'secondary'}>
                        {user.subscription}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Materiale: {user.materials_count}/{user.materials_limit === -1 ? '∞' : user.materials_limit}
                  </div>
                </div>
                <div className="flex gap-2">
                  {user.role === 'admin' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAdmin(user.user_id)}
                      disabled={removeAdminRole.isPending || user.user_id === currentUser.id}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      {user.user_id === currentUser.id ? 'Tu' : 'Elimină Admin'}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handlePromoteUser(user.user_id)}
                      disabled={promoteToAdmin.isPending}
                    >
                      <ShieldCheck className="h-4 w-4 mr-1" />
                      Fă Admin
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {(!users || users.length === 0) && (
              <div className="text-center text-gray-500 py-8">
                Nu s-au găsit utilizatori
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
