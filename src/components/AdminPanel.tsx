
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, Users } from 'lucide-react';
import { useAdminOperations } from '@/hooks/useAdminOperations';

const AdminPanel = () => {
  const { isAdmin, users, usersLoading, promoteToAdmin, removeAdminRole } = useAdminOperations();

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            Nu ai permisiuni de administrator
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
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                      onClick={() => removeAdminRole.mutate(user.user_id)}
                      disabled={removeAdminRole.isPending}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Elimină Admin
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => promoteToAdmin.mutate(user.user_id)}
                      disabled={promoteToAdmin.isPending}
                    >
                      <ShieldCheck className="h-4 w-4 mr-1" />
                      Fă Admin
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
