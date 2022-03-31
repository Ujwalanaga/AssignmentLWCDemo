public class GetAccountDetails {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(String searchKey, String sortBy, String sortDirection) {        
        String query = 'SELECT Id, Name,OwnerId,Owner.Name,Phone,WebSite,AnnualRevenue FROM Account';
        if ( searchKey != null && searchKey != '' ) {
            String key = '%' + searchKey + '%';
            query += ' WHERE Industry = \'Financial Services\' AND Name LIKE :key';
        }else{
            query += ' WHERE Industry = \'Financial Services\'';
        }
        if ( sortBy != null && sortDirection != null ) {
            query += ' ORDER BY ' + sortBy + ' ' + sortDirection;
        }
        query = query + ' LIMIT 5';
        return Database.query( query );
    }

    @AuraEnabled
    public static void saveRecords(List<Account> listOfAccount){
        try {
          if (!listOfAccount.isEmpty()) {
              update listOfAccount;
          }  
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}